# AI FAQ Bot Integration Guide

This guide shows exactly where to integrate the AI FAQ bot features into your FAQ page.

## Backend Setup ✅ COMPLETED

1. **Router Registration** - Already done in `src/app/api/v1/api.py:25,46`
   - Import added: `from src.routers import faq_bot`
   - Router registered: `api_router.include_router(faq_bot.router, prefix="/faq-bot", tags=["AI Assistant"])`

2. **Schemas Added** - Already done in `src/schemas/faq.py:58-69`
   - `FAQRequest` - For incoming AI bot questions
   - `AIWidgetResponse` - For AI-generated summary

3. **API Client Functions** - Already done in `frontend/src/lib/api/faqs.ts:148-198`
   - `askAIQuestion()` - Ask AI a question
   - `getAISummary()` - Get AI summary for listing

## Frontend Integration - Changes Needed

### File: `frontend/src/app/threads/[threadId]/listings/[listingId]/faq/page.tsx`

#### Change 1: Update Imports (Line 17-23)
```typescript
// ADD these to existing imports:
import {
  fetchFAQsByListingId,
  createQuestion,
  answerQuestion,
  voteFAQ,
  FAQ,
  getAISummary,        // ← ADD THIS
  askAIQuestion,       // ← ADD THIS
} from "@/lib/api/faqs";
```

#### Change 2: Remove Mock Data & Add AI State (Line 190-191)
```typescript
// REMOVE THIS LINE:
const aiSummary = mockAiSummary;

// REPLACE WITH:
// ============ AI INTEGRATION: State for AI Summary ============
const [aiSummary, setAiSummary] = useState<string>("");
const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
// ==============================================================
```

#### Change 3: Add AI Handler Functions (After line 451, before `const filteredQuestions`)
```typescript
  // ============ AI INTEGRATION: Generate AI Summary Handler ============
  const handleGenerateAISummary = async () => {
    try {
      setAiSummaryLoading(true);
      const token = await getToken();
      const apiClient = createClerkApiClient(token);

      const summaryData = await getAISummary(apiClient.instance, listingId);

      // Format the summary with key features and common questions
      let formattedSummary = summaryData.summary;

      if (summaryData.key_features && summaryData.key_features.length > 0) {
        formattedSummary += "\n\n## Key Features\n";
        summaryData.key_features.forEach(feature => {
          formattedSummary += `- ${feature}\n`;
        });
      }

      if (summaryData.common_questions && summaryData.common_questions.length > 0) {
        formattedSummary += "\n\n## Common Questions\n";
        summaryData.common_questions.forEach(q => {
          formattedSummary += `- ${q}\n`;
        });
      }

      setAiSummary(formattedSummary);
    } catch (error) {
      console.error("Failed to generate AI summary:", error);
      setAiSummary("Failed to generate summary. Please try again later.");
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // ============ AI INTEGRATION: Ask AI Question Handler ============
  const handleAskAIQuestion = async (question: string) => {
    try {
      const token = await getToken();
      const apiClient = createClerkApiClient(token);

      // Get current user data to extract user_id
      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const aiResponse = await askAIQuestion(apiClient.instance, {
        listing_id: listingId,
        question: question,
        user_id: userResponse.data.id,
      });

      // Add the AI-answered question to the questions list
      const newQuestion: QuestionType = {
        id: aiResponse.data.id.toString(),
        question: aiResponse.data.question,
        description: "",
        answers: aiResponse.data.answer ? [{
          id: `answer-${aiResponse.data.id}`,
          user: aiResponse.data.answer_username || "AI Assistant",
          text: aiResponse.data.answer,
          isAccepted: aiResponse.data.is_accepted,
          likes: aiResponse.data.helpful_count,
          dislikes: aiResponse.data.not_helpful_count,
          replies: [],
        }] : [],
        isAnsweredByPoster: false,
      };

      setQuestions((prev) => [newQuestion, ...prev]);

      // Show a notification based on whether it was found or created
      if (aiResponse.status === "found") {
        alert("Similar question found! Showing existing answer.");
      } else {
        alert("AI has generated an answer for your question!");
      }

      // Switch to answered tab to see the result
      setActiveTab("answered");
    } catch (error) {
      console.error("Failed to ask AI question:", error);
      alert("Failed to get AI answer. Please try again.");
    }
  };
  // ==================================================================
```

#### Change 4: Update AISummary Component Props (Line ~507 and ~642)
```typescript
// FIND (around line 507):
<div className="lg:hidden">
  <AISummary content={aiSummary} />
</div>

// REPLACE WITH:
<div className="lg:hidden">
  {/* ============ AI INTEGRATION: Connected AI Summary ============ */}
  <AISummary
    content={aiSummary}
    isLoading={aiSummaryLoading}
    onGenerateSummary={handleGenerateAISummary}
    onAskQuestion={handleAskAIQuestion}
  />
  {/* ============================================================== */}
</div>

// ALSO FIND (around line 642):
<div className="hidden lg:block">
  <AISummary content={aiSummary} />
</div>

// REPLACE WITH:
<div className="hidden lg:block">
  {/* ============ AI INTEGRATION: Connected AI Summary ============ */}
  <AISummary
    content={aiSummary}
    isLoading={aiSummaryLoading}
    onGenerateSummary={handleGenerateAISummary}
    onAskQuestion={handleAskAIQuestion}
  />
  {/* ============================================================== */}
</div>
```

#### Change 5: Remove Mock Import (Line 14)
```typescript
// REMOVE THIS LINE:
import { mockAiSummary } from "@/utils/mock-all-data-used";
```

## How It Works

### 1. AI Summary Feature
- User clicks "Generate AI Summary" button
- Frontend calls `getAISummary()` API function
- Backend (`/api/v1/faq-bot/summary/{listing_id}`) processes:
  - Fetches listing details
  - Fetches existing FAQs
  - Uses Gemini AI to generate summary with key features
- Summary is displayed in the sidebar

### 2. Ask AI Question Feature
- User types question in "Ask AI" input field (shown when summary is expanded)
- Frontend calls `askAIQuestion()` API function
- Backend (`/api/v1/faq-bot/ask`) processes:
  - **Semantic Search**: Checks if similar question exists using vector embeddings (cosine similarity > 0.88)
  - **If Found**: Returns existing answer
  - **If Not Found**: Uses Gemini AI to generate answer based on listing context
  - Saves Q&A and its vector embedding to database
- New Q&A appears in the "Answered" tab

## API Endpoints Summary

### Backend Endpoints (Already Registered)
- `POST /api/v1/faq-bot/ask` - Ask AI a question (with semantic search)
- `GET /api/v1/faq-bot/summary/{listing_id}` - Get AI-generated summary

### Frontend API Client (Already Created)
- `askAIQuestion(apiClient, data)` - Located in `lib/api/faqs.ts:180`
- `getAISummary(apiClient, listingId)` - Located in `lib/api/faqs.ts:192`

## Testing Checklist

After making the changes:

1. ✅ Backend: Check if faq_bot router is registered (already done)
2. ✅ Frontend: Import AI functions from faqs.ts
3. ✅ Frontend: Remove mock data import
4. ✅ Frontend: Add AI state variables
5. ✅ Frontend: Add AI handler functions
6. ✅ Frontend: Update AISummary component props (2 places)
7. 🧪 Test "Generate AI Summary" button
8. 🧪 Test "Ask AI" question input
9. 🧪 Verify AI answers appear in "Answered" tab
10. 🧪 Test semantic search (ask similar questions)

## Files Modified

### Backend (Already Complete ✅)
- `backend/src/schemas/faq.py` - Added AI schemas
- `backend/src/app/api/v1/api.py` - Registered faq_bot router
- `backend/src/routers/faq_bot.py` - Fixed imports

### Frontend (Already Complete ✅)
- `frontend/src/lib/api/faqs.ts` - Added AI API functions
- `frontend/src/components/threads/product-faq/AISummary.tsx` - Added callback props

### Frontend (Needs Changes ⚠️)
- `frontend/src/app/threads/[threadId]/listings/[listingId]/faq/page.tsx` - Needs 5 changes above

## Notes

- AI features require Google Gemini API to be configured in the backend
- Semantic search uses vector embeddings stored in `faq_embeddings` table
- AI-generated answers are saved to FAQ table with `answer_username="AI_Assistant"`

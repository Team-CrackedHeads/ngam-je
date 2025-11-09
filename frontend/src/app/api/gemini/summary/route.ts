import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Ensure the API key is loaded from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  // In a production app, you might want to throw an error or handle this more robustly
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || ""); // Provide a default empty string if not set, though it will fail later

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { faqs, listingTitle } = await request.json();

    if (!faqs || !Array.isArray(faqs) || !listingTitle) {
      return NextResponse.json(
        { error: "Invalid request body. 'faqs' (array) and 'listingTitle' (string) are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Format the FAQs into a string for the prompt
    // We only want to summarize answered questions for a meaningful summary
    const answeredFaqs = faqs.filter((q: any) => q.answers && q.answers.length > 0);

    let formattedFaqs = "";
    if (answeredFaqs.length > 0) {
      formattedFaqs = answeredFaqs
        .map((q: any) => {
          const answers = q.answers
            .map((a: any) => `  - Answer: ${a.text}`)
            .join("\n");
          return `Question: ${q.question}\n${answers}`;
        })
        .join("\n\n");
    } else {
      formattedFaqs = "No questions have been answered yet for this listing.";
    }


    const prompt = `
      You are an AI assistant tasked with summarizing frequently asked questions (FAQs) for a product listing.
      Please provide a concise and informative summary of the following FAQs for the listing titled "${listingTitle}".
      Focus on the most common themes, key information, and important details from the *answered* questions.
      If there are no answered questions, state that clearly in the summary.

      FAQs:
      ${formattedFaqs}

      Summary:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary. Please try again later." },
      { status: 500 }
    );
  }
}
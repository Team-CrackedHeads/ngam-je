"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import AISummary from "@/components/threads/product-faq/AISummary";
import AIChatbot from "@/components/threads/product-faq/AIChatbot"; // Import the new chatbot component
import Question from "@/components/threads/product-faq/Question";
import { Question as QuestionType, Answer, VoteType } from "@/components/threads/product-faq/types";
import { getListingFAQs, getListingById } from "@/utils/mock-all-data-used";

const FAQPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const listingId = params.listingId as string;
  const category = params.threadCategory as string;

  const listing = getListingById(listingId);

  const [questions, setQuestions] = useState<QuestionType[]>(
    getListingFAQs(listingId)
  );

  // --- AI Summary State ---
  const [aiSummaryContent, setAiSummaryContent] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  // --- End AI Summary State ---

  const handleBackClick = () => {
    router.push(`/threads/${category}/${listingId}`);
  };

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null
  );
  const [newAnswerInputs, setNewAnswerInputs] = useState<{
    [key: string]: string;
  }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [replyVisible, setReplyVisible] = useState<Set<string>>(new Set());
  const [collapsedAnswers, setCollapsedAnswers] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState<"unanswered" | "answered">(
    "unanswered"
  );
  const [userVotes, setUserVotes] = useState<{ [answerId: string]: VoteType }>(
    {}
  );

  // --- AI Summary Generation Function ---
  const generateAiSummary = useCallback(async () => {
    if (!listing) return;

    setIsSummaryLoading(true);
    setSummaryError(null);

    try {
      const response = await fetch("/api/gemini/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faqs: questions,
          listingTitle: listing.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch AI summary.");
      }

      const data = await response.json();
      setAiSummaryContent(data.summary);
    } catch (error: any) {
      console.error("Error generating AI summary:", error);
      setSummaryError(error.message || "An unexpected error occurred.");
      setAiSummaryContent(null);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [listing, questions]);

  // ... rest of your existing handler functions stay exactly the same ...
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestionId((prev) => (prev === questionId ? null : questionId));
  };

  const handleNewAnswerChange = (questionId: string, value: string) => {
    setNewAnswerInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitNewAnswer = (questionId: string) => {
    const newAnswerText = newAnswerInputs[questionId]?.trim();
    if (!newAnswerText) return;

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: [
                ...q.answers,
                {
                  id: `a${q.answers.length + 1}_${Date.now()}`,
                  user: "You",
                  text: newAnswerText,
                  likes: 0,
                  dislikes: 0,
                  replies: [],
                },
              ],
            }
          : q
      )
    );
    setNewAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
  };

  const handleLikeDislike = (
    questionId: string,
    answerId: string,
    type: "like" | "dislike"
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;

        const updateVotes = (answers: Answer[]): Answer[] =>
          answers.map((a) => {
            if (a.id === answerId) {
              const currentVote = userVotes[answerId] || null;
              let likes = a.likes || 0;
              let dislikes = a.dislikes || 0;

              if (currentVote === type) {
                if (type === "like") likes--;
                else dislikes--;
                setUserVotes((prevVotes) => ({
                  ...prevVotes,
                  [answerId]: null,
                }));
              } else {
                if (currentVote === "like") likes--;
                if (currentVote === "dislike") dislikes--;
                if (type === "like") likes++;
                else dislikes++;
                setUserVotes((prevVotes) => ({
                  ...prevVotes,
                  [answerId]: type,
                }));
              }

              return { ...a, likes, dislikes };
            }
            if (a.replies && a.replies.length > 0) {
              return { ...a, replies: updateVotes(a.replies) };
            }
            return a;
          });

        return { ...q, answers: updateVotes(q.answers) };
      })
    );
  };

  const toggleCollapseAnswer = (answerId: string) => {
    setCollapsedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(answerId)) newSet.delete(answerId);
      else newSet.add(answerId);
      return newSet;
    });
  };

  const toggleReplyField = (answerId: string) => {
    setReplyVisible((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(answerId)) newSet.delete(answerId);
      else newSet.add(answerId);
      return newSet;
    });
  };

  const handleReplyChange = (answerId: string, value: string) => {
    setReplyInputs((prev) => ({ ...prev, [answerId]: value }));
  };

  const submitReply = (questionId: string, parentAnswerId: string) => {
    const replyText = replyInputs[parentAnswerId]?.trim();
    if (!replyText) return;

    const addReply = (answers: Answer[]): Answer[] =>
      answers.map((a) => {
        if (a.id === parentAnswerId) {
          return {
            ...a,
            replies: [
              ...(a.replies || []),
              {
                id: `r_${Date.now()}`,
                user: "You",
                text: replyText,
                likes: 0,
                dislikes: 0,
                replies: [],
              },
            ],
          };
        }
        if (a.replies && a.replies.length > 0) {
          return { ...a, replies: addReply(a.replies) };
        }
        return a;
      });

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, answers: addReply(q.answers) } : q
      )
    );
    setReplyInputs((prev) => ({ ...prev, [parentAnswerId]: "" }));
    setReplyVisible((prev) => {
      const newSet = new Set(prev);
      newSet.delete(parentAnswerId);
      return newSet;
    });
  };

  const filteredQuestions = questions.filter((q) =>
    activeTab === "answered" ? q.answers.length > 0 : q.answers.length === 0
  );

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Listing Not Found</h1>
          <button
            onClick={() => router.push(`/threads/${category}`)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Back to {category}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-900)] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackClick}
          className="p-2 rounded-full hover:bg-secondary-subtle transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6 text-[color:var(--color-primary-700)]" />
        </button>
        <h1 className="text-2xl font-semibold text-[color:var(--color-primary-800)]">
          FAQ - {listing.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="md:col-span-2 space-y-6">
          {/* Mobile AI Summary */}
          <div className="lg:hidden">
            <AISummary
              content={aiSummaryContent}
              isLoading={isSummaryLoading}
              error={summaryError}
              onGenerateSummary={generateAiSummary}
            />
          </div>

          {/* Mobile AI Chatbot */}
          <div className="lg:hidden">
            <AIChatbot listingId={listingId} listingTitle={listing.title} />
          </div>

          <div className="flex justify-center border-[color:var(--color-border)] mt-4 space-x-6">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "unanswered"
                  ? "border-b-2 border-[color:var(--color-primary-700)] text-[color:var(--color-primary-800)]"
                  : "text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary-700)]"
              }`}
              onClick={() => setActiveTab("unanswered")}
            >
              Unanswered
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "answered"
                  ? "border-b-2 border-[color:var(--color-primary-700)] text-[color:var(--color-primary-800)]"
                  : "text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary-700)]"
              }`}
              onClick={() => setActiveTab("answered")}
            >
              Answered
            </button>
          </div>

          <div className="space-y-4 mb-20 lg:mb-6">
            {filteredQuestions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Image
                  src="/images/faq-placeholder.svg"
                  alt="No FAQs found"
                  width={250}
                  height={250}
                  className="mb-6"
                />
                <p className="text-lg font-medium text-[color:var(--color-primary-800)] mb-2">
                  No {activeTab} questions yet
                </p>
                <p className="text-sm text-[color:var(--color-muted-foreground)] text-center max-w-md">
                  {activeTab === "unanswered"
                    ? "Be the first to ask a question about this listing!"
                    : "No questions have been answered yet. Check back later!"}
                </p>
              </div>
            )}

            {filteredQuestions.map((q) => (
              <Question
                key={q.id}
                id={q.id}
                question={q.question}
                description={q.description}
                answers={q.answers}
                isExpanded={expandedQuestionId === q.id}
                newAnswerInput={newAnswerInputs[q.id] || ""}
                onToggle={() => toggleQuestion(q.id)}
                onNewAnswerChange={(value) =>
                  handleNewAnswerChange(q.id, value)
                }
                onSubmitAnswer={() => submitNewAnswer(q.id)}
                onLikeDislike={(answerId, type) =>
                  handleLikeDislike(q.id, answerId, type)
                }
                userVotes={userVotes}
                collapsedAnswers={collapsedAnswers}
                onToggleCollapse={toggleCollapseAnswer}
                replyVisible={replyVisible}
                onToggleReply={toggleReplyField}
                replyInputs={replyInputs}
                onReplyChange={handleReplyChange}
                onSubmitReply={(parentAnswerId) =>
                  submitReply(q.id, parentAnswerId)
                }
                initialVisibleAnswers={3}
                initialVisibleReplies={3}
                maxDepth={3}
              />
            ))}
          </div>
        </div>

        {/* Right Column (Desktop AI Summary & Chatbot) */}
        <div className="hidden lg:block space-y-6"> {/* Added space-y-6 for spacing between components */}
          <AISummary
            content={aiSummaryContent}
            isLoading={isSummaryLoading}
            error={summaryError}
            onGenerateSummary={generateAiSummary}
          />
          <AIChatbot listingId={listingId} listingTitle={listing.title} />
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
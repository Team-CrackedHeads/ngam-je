"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import AISummary from "@/components/threads/product-faq/AISummary";
import Question from "@/components/threads/product-faq/Question";
import { Question as QuestionType, Answer, VoteType } from "@/components/threads/product-faq/types";
import { mockAiSummary } from "@/utils/mock-all-data-used";
import { createClerkApiClient } from "@/lib/clerk-api-client";
import { fetchListingById } from "@/lib/api/listings";
import { fetchFAQsByListingId, createQuestion, answerQuestion, voteFAQ, markFAQAsAccepted, FAQ } from "@/lib/api/faqs";
import type { Listing } from "@/lib/api/listings";

const FAQPage: React.FC = () => {
  // Get params from URL
  const params = useParams();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const listingId = parseInt(params.listingId as string);
  const threadId = params.threadId as string;

  // State for listing and FAQs
  const [listing, setListing] = useState<Listing | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionType[]>([]);

  // Convert backend FAQ format to frontend Question format
  const convertFAQsToQuestions = useCallback((faqList: FAQ[], currentUserId: string | null | undefined): QuestionType[] => {
    return faqList.map((faq) => {
      const answers: Answer[] = [];

      // If the FAQ has an answer, add it
      if (faq.answer && faq.answer_username) {
        answers.push({
          id: `answer-${faq.id}`,
          user: faq.answer_username,
          text: faq.answer,
          isAccepted: faq.is_accepted,
          likes: faq.helpful_count,
          dislikes: faq.not_helpful_count,
          replies: [], // Backend doesn't support nested replies yet
        });
      }

      return {
        id: faq.id.toString(),
        question: faq.question,
        description: "", // Backend doesn't have separate description
        answers,
        isAnsweredByPoster: faq.answer_user_id?.toString() === listing?.creator_id?.toString(),
      };
    });
  }, [listing?.creator_id]);

  // Fetch listing and FAQs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const apiClient = createClerkApiClient(token);

        // Fetch listing and FAQs in parallel
        const [listingData, faqData] = await Promise.all([
          fetchListingById(apiClient.instance, listingId),
          fetchFAQsByListingId(apiClient.instance, listingId),
        ]);

        setListing(listingData);
        setFaqs(faqData);
        setQuestions(convertFAQsToQuestions(faqData, userId));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken, listingId, userId, convertFAQsToQuestions]);

  const handleBackClick = () => {
    // Go back to the listing page
    router.push(`/threads/${threadId}/listings/${listingId}`);
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

  const aiSummary = mockAiSummary;

  // ... rest of your existing handler functions stay exactly the same ...
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestionId((prev) => (prev === questionId ? null : questionId));
  };

  const handleNewAnswerChange = (questionId: string, value: string) => {
    setNewAnswerInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitNewAnswer = async (questionId: string) => {
    const newAnswerText = newAnswerInputs[questionId]?.trim();
    if (!newAnswerText) return;

    try {
      const token = await getToken();
      const apiClient = createClerkApiClient(token);

      // Call API to submit answer
      const updatedFAQ = await answerQuestion(apiClient.instance, parseInt(questionId), {
        answer: newAnswerText,
      });

      // Update local state with the new answer
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answers: [
                  {
                    id: `answer-${updatedFAQ.id}`,
                    user: updatedFAQ.answer_username || "You",
                    text: updatedFAQ.answer || newAnswerText,
                    isAccepted: updatedFAQ.is_accepted,
                    likes: updatedFAQ.helpful_count,
                    dislikes: updatedFAQ.not_helpful_count,
                    replies: [],
                  },
                ],
              }
            : q
        )
      );
      setNewAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
    }
  };

  const handleLikeDislike = async (
    questionId: string,
    answerId: string,
    type: "like" | "dislike"
  ) => {
    try {
      const token = await getToken();
      const apiClient = createClerkApiClient(token);
      const currentVote = userVotes[answerId] || null;

      // Only call API if this is a new vote or changing vote
      if (currentVote !== type) {
        await voteFAQ(apiClient.instance, parseInt(questionId), type === "like");

        // Update local state
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id !== questionId) return q;

            return {
              ...q,
              answers: q.answers.map((a) => {
                if (a.id === answerId) {
                  let likes = a.likes || 0;
                  let dislikes = a.dislikes || 0;

                  // Remove previous vote
                  if (currentVote === "like") likes--;
                  if (currentVote === "dislike") dislikes--;

                  // Add new vote
                  if (type === "like") likes++;
                  else dislikes++;

                  setUserVotes((prevVotes) => ({
                    ...prevVotes,
                    [answerId]: type,
                  }));

                  return { ...a, likes, dislikes };
                }
                return a;
              }),
            };
          })
        );
      }
    } catch (error) {
      console.error("Failed to vote:", error);
      alert("Failed to vote. Please try again.");
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-primary-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // Error handling for missing listing
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Listing Not Found</h1>
          <button
            onClick={() => router.push(`/threads/${threadId}`)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Back to Thread
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

      {/* Rest of your existing JSX stays exactly the same */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ... everything else stays the same ... */}
        <div className="md:col-span-2 space-y-6">
          <div className="lg:hidden">
            <AISummary content={aiSummary} />
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

        <div className="hidden lg:block">
          <AISummary content={aiSummary} />
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

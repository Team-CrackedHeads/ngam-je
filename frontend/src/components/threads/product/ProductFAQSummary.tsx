"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Answer } from "../product-faq/types";
import { createClerkApiClient } from "@/lib/clerk-api-client";
import { fetchFAQsByListingId, FAQ } from "@/lib/api/faqs";

// Helper function to determine the best answer based on the specified criteria
const getBestAnswer = (answers: Answer[]): Answer | undefined => {
  if (!answers || answers.length === 0) {
    return undefined;
  }

  // 1. Prioritize accepted answers
  const acceptedAnswers = answers.filter(answer => answer.isAccepted === true);
  if (acceptedAnswers.length > 0) {
    // If multiple accepted, return the first one found.
    return acceptedAnswers[0];
  }

  // Helper to safely get likes/dislikes, treating undefined as 0 for comparison
  const getLikes = (answer: Answer) => answer.likes ?? 0;
  const getDislikes = (answer: Answer) => answer.dislikes ?? 0;

  // 2. If no accepted answers, find by most likes, then least dislikes
  let bestAnswer: Answer = answers[0]; // Start with the first answer as the initial best

  for (let i = 1; i < answers.length; i++) {
    const currentAnswer = answers[i];

    const currentLikes = getLikes(currentAnswer);
    const bestLikes = getLikes(bestAnswer);
    const currentDislikes = getDislikes(currentAnswer);
    const bestDislikes = getDislikes(bestAnswer);

    if (currentLikes > bestLikes) {
      bestAnswer = currentAnswer;
    } else if (currentLikes === bestLikes) {
      // If likes are equal, prefer fewer dislikes
      if (currentDislikes < bestDislikes) {
        bestAnswer = currentAnswer;
      }
    }
  }

  return bestAnswer;
};

interface ProductFAQSummaryProps {
  threadId: number;
  listingId: string | number;
}

const ProductFAQSummary: React.FC<ProductFAQSummaryProps> = ({
  listingId,
  threadId,
}) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const apiClient = createClerkApiClient(token);
        const numericListingId = typeof listingId === 'string' ? parseInt(listingId) : listingId;
        const faqData = await fetchFAQsByListingId(apiClient.instance, numericListingId);
        setFaqs(faqData);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [getToken, listingId]);

  const handleFAQClick = () => {
    router.push(`/threads/${threadId}/listings/${listingId}/faq`);
  };

  // Convert backend FAQs to frontend format and get only the last three
  const convertedFAQs = faqs.map((faq) => ({
    id: faq.id.toString(),
    question: faq.question,
    description: "",
    answers: faq.answer && faq.answer_username ? [{
      id: `answer-${faq.id}`,
      user: faq.answer_username,
      text: faq.answer,
      isAccepted: faq.is_accepted,
      likes: faq.helpful_count,
      dislikes: faq.not_helpful_count,
      replies: [],
    }] : [],
    isAnsweredByPoster: false,
  }));

  const lastThreeFAQs = convertedFAQs.slice(-3);

  if (loading) {
    return (
      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-primary-100 p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Top FAQ</h2>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-primary-100 p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Top FAQ</h2>

        <div className="space-y-3">
          {lastThreeFAQs && lastThreeFAQs.length > 0 ? (
            lastThreeFAQs.map((faq, index: number) => (
              <div
                key={faq.id || index}
                className="border border-border rounded-lg overflow-hidden bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleFAQClick}
              >
                <span className="font-medium text-foreground">
                  {faq.question}
                </span>
                <br />
                {faq.answers && faq.answers.length > 0 ? (
                  (() => {
                    const bestAnswer = getBestAnswer(faq.answers);
                    return bestAnswer ? (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {bestAnswer.text}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 italic mt-1">No suitable answer found.</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-600 italic mt-1">No answers yet.</p>
                )}
              </div>
            ))
          ) : (
            <p>No questions posted.</p>
          )}
        </div>
      </div>
      <div className="w-full mt-4 md:mt-6 text-right sm:rounded-lg sm:max-w-4xl sm:mx-auto">
        <a
          className="text-primary hover:underline flex items-center justify-end cursor-pointer"
          onClick={handleFAQClick}
          role="button"
          tabIndex={0}
        >
          See more
          <MoveRight className="ml-1 w-4 h-4" />
        </a>
      </div>
    </>
  );
};

export default ProductFAQSummary;
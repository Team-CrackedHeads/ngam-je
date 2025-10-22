"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";
import { getListingFAQs } from "@/utils/mock-threads-faq-data";
import { Answer } from "../threads-product-faq/types"

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
  category: string;
  listingId: string;
}

const ProductFAQSummary: React.FC<ProductFAQSummaryProps> = ({
  listingId,
  category,
}) => {
  const router = useRouter();

  const currentFAQs = getListingFAQs(listingId);

  const handleFAQClick = () => {
    router.push(`/threads/${category}/${listingId}/faq`);
  };

  // Get only the last three FAQs
  const lastThreeFAQs = currentFAQs ? currentFAQs.slice(-3) : [];

  return (
    <>
      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-primary-100 p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Top FAQ</h2>

        <div className="space-y-3">
          {lastThreeFAQs && lastThreeFAQs.length > 0 ? (
            lastThreeFAQs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden bg-white p-3"
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
          className="text-primary hover:underline flex items-center justify-end"
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
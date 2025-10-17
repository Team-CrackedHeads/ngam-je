"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MoveRight } from "lucide-react";
import { placeholderFAQs, FAQItem } from "@/utils/mock-threads-topfaq-data";

interface Listing {
  id: string;
}

interface ProductFAQSummaryProps {
  faqs?: FAQItem[];
  category: string;
  listingId: string;
}

const ProductFAQSummary: React.FC<ProductFAQSummaryProps> = ({
  listingId,
  category,
  faqs,
}) => {
  const router = useRouter();

  const currentFAQs = faqs && faqs.length > 0 ? faqs : placeholderFAQs;

  const handleFAQClick = () => {
    router.push(`/threads/${category}/${listingId}/faq`);
  };

  return (
    <>
      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-primary-100 p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Top FAQ</h2>

        <div className="space-y-3">
          {currentFAQs ? (
            currentFAQs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden bg-white p-3"
                onClick={handleFAQClick}
              >
                <span className="font-medium text-foreground">
                  {faq.question}
                </span>
                <br />
                {faq.answer}
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

// /utils/mock-threads-faq-data.ts
import { Question } from "@/components/threads/product-faq/types";

// Structure: { [listingId: string]: Question[] }
export const mockListingFAQs: Record<string, Question[]> = {
  // Vintage Leather Jacket WTB FAQs
  "fash-002": [
    {
      id: "q1",
      question: "What is the condition of the jacket?",
      description: "",
      answers: [],
    },
    {
      id: "q2",
      question: "Do you have any brand preferences?",
      description: "",
      answers: [],
    },
    {
      id: "q3",
      question: "Are you open to negotiate on the price?",
      description: "",
      answers: [],
    },
  ],
  // Nike Kobe 5 Protro FAQs
  "fash-001": [
    {
      id: "q1",
      question: "What's the exact condition of the shoes?",
      description:
        "You mentioned indoor court only - any scuffs, sole separation, or yellowing?",
      answers: [
        {
          id: "a1_1",
          user: "HoopsMaster",
          text: "Condition is 8.5/10. Soles have great traction left, no separation. Minor scuffing on the toe box from pivoting but nothing major. No yellowing on the midsole. Insoles are still in great shape.",
          isAccepted: true,
          likes: 12,
          dislikes: 1,
          replies: [
            {
              id: "r1_1",
              user: "Baller23",
              text: "Can you post close-up pics of the sole and toe box?",
              likes: 3,
              dislikes: 0,
              replies: [
                {
                  id: "r1_1_1",
                  user: "HoopsMaster",
                  text: "Sure! I'll upload them to the gallery tonight.",
                  likes: 5,
                  dislikes: 0,
                  replies: [],
                },
              ],
            },
            {
              id: "r1_2",
              user: "CourtKing",
              text: "Indoor only is a big plus. These should last a while!",
              likes: 7,
              dislikes: 0,
              replies: [],
            },
          ],
        },
        {
          id: "a1_2",
          user: "SneakerHead88",
          text: "For indoor use only, that's actually really good condition. Indoor courts are way less harsh on shoes.",
          likes: 4,
          dislikes: 0,
          replies: [],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q2",
      question: "Is this colorway authentic or custom?",
      description:
        "You mentioned rare colorway - is this an official Nike release?",
      answers: [
        {
          id: "a2_1",
          user: "HoopsMaster",
          text: "100% authentic Nike release. This is the 'Bruce Lee' alternate colorway from the 2020 drop. Comes with original box and extra laces. Can provide receipt from Nike Store KL if needed.",
          isAccepted: true,
          likes: 18,
          dislikes: 0,
          replies: [
            {
              id: "r2_1",
              user: "AuthenticCheck",
              text: "Bruce Lee colorway is legit fire 🔥 Good price too!",
              likes: 9,
              dislikes: 0,
              replies: [],
            },
          ],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q3",
      question: "Does it fit true to size?",
      description:
        "I'm normally a size 10.5, should I size up or down for Kobe 5s?",
      answers: [
        {
          id: "a3_1",
          user: "HoopsMaster",
          text: "Kobe 5s fit snug, which is great for court feel. If you're 10.5, size 11 might actually work well for you. I'm a true 11 and these fit perfectly - not too tight, not loose.",
          isAccepted: true,
          likes: 6,
          dislikes: 0,
          replies: [],
        },
        {
          id: "a3_2",
          user: "SizeExpert",
          text: "Kobe models generally run narrow and snug. If you have wide feet, definitely size up. For normal width, TTS works.",
          likes: 8,
          dislikes: 1,
          replies: [
            {
              id: "r3_1",
              user: "WideFeetGuy",
              text: "Can confirm - I have wide feet and had to go half size up on Kobe 6s",
              likes: 3,
              dislikes: 0,
              replies: [],
            },
          ],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q4",
      question: "Can you ship to Penang?",
      description: "How much would shipping cost and how long would it take?",
      answers: [
        {
          id: "a4_1",
          user: "HoopsMaster",
          text: "Yes, I can ship nationwide! To Penang from JB, shipping via J&T would be around RM15-20. Takes about 3-5 days. Can also use Lalamove if you want faster delivery (1-2 days) but costs more.",
          isAccepted: true,
          likes: 5,
          dislikes: 0,
          replies: [],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q5",
      question: "Are the original insoles included?",
      description:
        "Some people replace insoles - do these still have the Nike Zoom insoles?",
      answers: [],
      isAnsweredByPoster: false,
    },
    {
      id: "q6",
      question: "Price negotiable?",
      description: "Interested but RM750 is slightly over my budget",
      answers: [],
      isAnsweredByPoster: false,
    },
  ],
};

// Helper function to get FAQs for a specific listing
export function getListingFAQs(listingId: string): Question[] {
  return mockListingFAQs[listingId] || [];
}

// Helper to check if listing has FAQs
export function hasListingFAQs(listingId: string): boolean {
  const faqs = mockListingFAQs[listingId];
  return faqs !== undefined && faqs.length > 0;
}

// Keep this if you still need it elsewhere
export const mockAiSummary = `
# Listing Analysis Summary

## Key Information Provided

Based on the current FAQ discussions, the listing has addressed the following critical details:

#### Sizing Information
Standard US sizing with reference to a size chart

#### Durability
High-quality vegan leather construction with reinforced stitching, expected lifespan of 12+ months with daily use

#### Build Quality
Multiple users confirm long-term satisfaction with durability

---

## Outstanding Questions

### Critical ⚠️

#### Warranty Terms
No response provided yet - this is a potential deal blocker for risk-averse buyers

---

## Community Insights

Users report shoes run slightly small - recommend sizing up

Verified user testimony: "Over a year with daily wear" indicates strong product reliability

---

## Negotiation Readiness Score: **75%**

#### To improve readiness:
1. Address warranty policy question
2. Add waterproofing/weather resistance details
3. Clarify return policy for incorrect sizing

---

*This analysis helps both buyers and sellers ensure all critical information is addressed before proceeding to negotiation.*
`;

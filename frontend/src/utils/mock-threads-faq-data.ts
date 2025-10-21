import { Question } from "@/components/threads/product-faq/types";

export const mockQuestions: Question[] = [
  {
    id: "q1",
    question: "Size of shoes?",
    description:
      "Information about shoe sizing and how to choose the right fit.",
    answers: [
      {
        id: "a1_1",
        user: "Poster",
        text: "The size of the shoes is standard US sizing. Please refer to our size chart for detailed measurements.",
        isAccepted: true,
        likes: 10,
        dislikes: 1,
        replies: [
          {
            id: "r1_1",
            user: "User2",
            text: "Thanks for clarifying!",
            likes: 2,
            dislikes: 0,
            replies: [
              {
                id: "r2_1",
                user: "User2",
                text: "Thanks for clarifying!",
                likes: 2,
                dislikes: 0,
                replies: [
                  {
                    id: "r3_1",
                    user: "User2",
                    text: "Thanks for clarifying!",
                    likes: 2,
                    dislikes: 0,
                    replies: [
                      {
                        id: "r4_1",
                        user: "User2",
                        text: "Thanks for clarifying!",
                        likes: 2,
                        dislikes: 0,
                        replies: [
                          {
                            id: "r5_1",
                            user: "User2",
                            text: "Thanks for clarifying!",
                            likes: 2,
                            dislikes: 0,
                            replies: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "r1_2",
            user: "User2",
            text: "Thanks for clarifying!",
            likes: 2,
            dislikes: 0,
            replies: [],
          },
          {
            id: "r1_3",
            user: "User2",
            text: "Thanks for clarifying!",
            likes: 2,
            dislikes: 0,
            replies: [],
          },
          {
            id: "r1_4",
            user: "User2",
            text: "Thanks for clarifying!",
            likes: 2,
            dislikes: 0,
            replies: [],
          },
          {
            id: "r1_5",
            user: "User2",
            text: "Thanks for clarifying!",
            likes: 2,
            dislikes: 0,
            replies: [],
          },
          {
            id: "r1_6",
            user: "User2",
            text: "Thanks for clarifying!",
            likes: 2,
            dislikes: 0,
            replies: [],
          },
          {
            id: "r1_7",
            user: "User2",
            text: "Thanks for clarifying!",
            likes: 2,
            dislikes: 0,
            replies: [],
          },
        ],
      },
      {
        id: "a1_2",
        user: "User1",
        text: "I found them to run a bit small, so I recommend sizing up.",
        likes: 3,
        dislikes: 0,
        replies: [],
      },
      {
        id: "a1_3",
        user: "3",
        text: "gfhfghgfhfghfgh",
        likes: 999,
        dislikes: 0,
        replies: [],
      },
      {
        id: "a1_4",
        user: "4",
        text: "gfhfghgfhfghfgh",
        likes: 999,
        dislikes: 0,
        replies: [],
      },
      {
        id: "a1_5",
        user: "5",
        text: "gfhfghgfhfghfgh",
        likes: 999,
        dislikes: 0,
        replies: [],
      },
      {
        id: "a1_6",
        user: "6",
        text: "gfhfghgfhfghfgh",
        likes: 999,
        dislikes: 0,
        replies: [],
      },
      {
        id: "a1_7",
        user: "7",
        text: "gfhfghgfhfghfgh",
        likes: 999,
        dislikes: 0,
        replies: [],
      },
      {
        id: "a1_8",
        user: "8",
        text: "gfhfghgfhfghfgh",
        likes: 999,
        dislikes: 99999999999,
        replies: [],
      },
    ],
    isAnsweredByPoster: true,
  },
  {
    id: "q2",
    question: "Durability of shoes?",
    description:
      "Details regarding the expected lifespan and build quality of the shoes.",
    answers: [
      {
        id: "a2_1",
        user: "Poster",
        text: "It's quite durable and will last for months. It's made out of high-quality vegan leather and reinforced stitching.",
        isAccepted: true,
        likes: 8,
        dislikes: 0,
        replies: [],
      },
      {
        id: "a2_2",
        user: "User2",
        text: "Mine lasted over a year with daily wear, very impressed!",
        likes: 5,
        dislikes: 0,
        replies: [],
      },
    ],
    isAnsweredByPoster: true,
  },
  {
    id: "q3",
    question: "Warranty of shoes?",
    description: "Details regarding the warranty of the shoes.",
    answers: [],
    isAnsweredByPoster: false,
  },
];

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

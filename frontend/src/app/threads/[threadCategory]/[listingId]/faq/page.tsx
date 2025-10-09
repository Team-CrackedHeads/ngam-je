"use client";

import "@/app/globals.css";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ChevronLeft,
  Send,
  CircleCheck,
  Circle,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Puzzle,
} from "lucide-react";

interface Answer {
  id: string;
  user: string;
  text: string;
  isAccepted?: boolean;
  likes?: number;
  dislikes?: number;
  replies?: Answer[];
}

interface Question {
  id: string;
  question: string;
  description: string;
  answers: Answer[];
  isAnsweredByPoster: boolean;
}

type VoteType = "like" | "dislike" | null;

const FAQPage: React.FC = () => {
  const handleBackClick = () => window.history.back();

  const [aiQuestion, setAiQuestion] = useState<string>("");
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

  // Tracks user's votes per answer (memory only)
  const [userVotes, setUserVotes] = useState<{ [answerId: string]: VoteType }>(
    {}
  );

  const [questions, setQuestions] = useState<Question[]>([
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
      description:
        "Details regarding the warranty of the shoes.",
      answers: [
      ],
      isAnsweredByPoster: false,
    },
  ]);

  const aiSummary = `
    This product's FAQ covers common inquiries about sizing, durability, warranty, waterproofing, materials, returns, and fit for wide feet.
  `;

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
                // Untoggle
                if (type === "like") likes--;
                else dislikes--;
                setUserVotes((prevVotes) => ({
                  ...prevVotes,
                  [answerId]: null,
                }));
              } else {
                // Remove previous opposite vote if exists
                if (currentVote === "like") likes--;
                if (currentVote === "dislike") dislikes--;
                // Add new vote
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

  const renderAnswers = (questionId: string, answers: Answer[], depth = 0) => (
    <div
      className={`mt-2 space-y-2 ${
        depth > 0 ? `ml-${Math.min(depth * 4, 24)}` : ""
      }`}
    >
      {answers.map((answer) => {
        const collapsed = collapsedAnswers.has(answer.id);
        const vote = userVotes[answer.id] || null;
        const replyShown = replyVisible.has(answer.id);

        return (
          <div
            key={answer.id}
            className="bg-[color:var(--color-secondary-50)] p-3 rounded-md"
          >
            <div className="flex justify-between items-center">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => toggleCollapseAnswer(answer.id)}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4 text-[color:var(--color-muted-foreground)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[color:var(--color-muted-foreground)]" />
                )}
                <p className="text-sm font-medium text-[color:var(--color-secondary-800)]">
                  {answer.user}{" "}
                  {answer.isAccepted && (
                    <span className="text-xs text-[color:var(--color-secondary-600)]">
                      (Accepted)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                    vote === "like"
                      ? "bg-[color:var(--color-primary-600)] text-white"
                      : "bg-[color:var(--color-secondary-100)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-secondary-200)]"
                  }`}
                  onClick={() =>
                    handleLikeDislike(questionId, answer.id, "like")
                  }
                >
                  <ThumbsUp className="h-4 w-4" /> {answer.likes ?? 0}
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                    vote === "dislike"
                      ? "bg-[color:var(--color-primary-600)] text-white"
                      : "bg-[color:var(--color-secondary-100)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-secondary-200)]"
                  }`}
                  onClick={() =>
                    handleLikeDislike(questionId, answer.id, "dislike")
                  }
                >
                  <ThumbsDown className="h-4 w-4" /> {answer.dislikes ?? 0}
                </button>
              </div>
            </div>

            {!collapsed && (
              <>
                <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1">
                  {answer.text}
                </p>

                {/* Reply Button */}
                <button
                  onClick={() => toggleReplyField(answer.id)}
                  className="mt-2 text-sm text-[color:var(--color-primary-700)] hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Reply
                </button>

                {/* Reply input (hidden by default) */}
                {replyShown && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Reply..."
                      className="flex-grow p-2 rounded-lg border border-[color:var(--color-border)] text-sm"
                      value={replyInputs[answer.id] || ""}
                      onChange={(e) =>
                        handleReplyChange(answer.id, e.target.value)
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && submitReply(questionId, answer.id)
                      }
                    />
                    <button
                      onClick={() => submitReply(questionId, answer.id)}
                      className="p-2 rounded-md bg-[color:var(--color-primary-700)] text-white hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Nested replies */}
                {answer.replies &&
                  answer.replies.length > 0 &&
                  renderAnswers(questionId, answer.replies, depth + 1)}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const sendAiQuestion = () => {
    if (aiQuestion.trim()) {
      console.log("Asking AI:", aiQuestion);
      setAiQuestion("");
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-900)] p-4 md:p-6 lg:p-8">
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
          Frequently Asked Questions
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Ask AI Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask AI about this product..."
              className="flex-grow p-3 pr-12 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-card)]"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendAiQuestion()}
            />
            <button
              onClick={sendAiQuestion}
              disabled={!aiQuestion.trim()}
              className="absolute right-2 p-2 rounded-md bg-[color:var(--color-primary-800)] text-white hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* AI Summary (Mobile) */}
          <div className="lg:hidden border border-[color:var(--color-border)] p-4 bg-card backdrop-blur-md rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-secondary-500">
                <Puzzle className="w-4 h-4 md:w-5 md:h-5 text-accent-700" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                AI Summary
              </h3>
            </div>
            <p className="text-[color:var(--color-muted-foreground)] text-sm leading-relaxed">
              {aiSummary}
            </p>
          </div>

          {/* Questions List */}
          <div className="space-y-4 mb-20 lg:mb-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-[color:var(--color-card)] border border-[color:var(--color-border)] rounded-lg shadow-sm"
              >
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-secondary-subtle transition-colors"
                  onClick={() => toggleQuestion(q.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {q.isAnsweredByPoster ? (
                      <CircleCheck
                        className="h-5 w-5 text-[color:var(--color-secondary-600)]"
                        fill="currentColor"
                      />
                    ) : (
                      <Circle className="h-5 w-5 text-[color:var(--color-muted-foreground)]" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-[color:var(--color-primary-800)]">
                      {q.question}
                    </h3>
                    <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1">
                      {q.description}
                    </p>
                  </div>
                </div>

                {expandedQuestionId === q.id && (
                  <div className="border-t border-[color:var(--color-border)] p-4 space-y-4">
                    {renderAnswers(q.id, q.answers)}

                    {/* New Answer Input */}
                    <div className="relative flex items-center mt-4">
                      <input
                        type="text"
                        placeholder="Write your answer..."
                        className="flex-grow p-3 pr-12 rounded-lg border border-[color:var(--color-border)]"
                        value={newAnswerInputs[q.id] || ""}
                        onChange={(e) =>
                          handleNewAnswerChange(q.id, e.target.value)
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" && submitNewAnswer(q.id)
                        }
                      />
                      <button
                        onClick={() => submitNewAnswer(q.id)}
                        disabled={!newAnswerInputs[q.id]?.trim()}
                        className="absolute right-2 p-2 rounded-md bg-accent-gradient text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        {/* <div className="hidden lg:block md:col-span-1 bg-card border border-[color:var(--color-border)] backdrop-blur-md rounded-2xl p-6 shadow-sm h-fit sticky top-6">
          <h2 className="text-xl font-semibold text-[color:var(--color-primary-800)] mb-4">
            AI Summary
          </h2>
          <p className="text-[color:var(--color-muted-foreground)] leading-relaxed">
            {aiSummary}
          </p>
        </div> */}
        <div className="hidden lg:block bg-card backdrop-blur-md rounded-2xl shadow-lg border-2 border-border overflow-hidden mb-6">
          {/* Header (clean, no separator) */}
          <div className="w-full bg-secondary-subtle px-4 md:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-secondary-500">
                <Puzzle className="w-4 h-4 md:w-5 md:h-5 text-accent-700" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                AI Summary
              </h3>
            </div>
            <br />
            <p className="text-[color:var(--color-muted-foreground)] leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

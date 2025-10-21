"use client";

import "@/app/globals.css";
import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import AISummary from "@/components/threads/product-faq/AISummary";
import Question from "@/components/threads/product-faq/Question";
import { Question as QuestionType, Answer, VoteType } from "@/components/threads/product-faq/types";
import { mockQuestions, mockAiSummary } from "@/utils/mock-threads-faq-data";

const FAQPage: React.FC = () => {
  const handleBackClick = () => window.history.back();

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [newAnswerInputs, setNewAnswerInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [replyVisible, setReplyVisible] = useState<Set<string>>(new Set());
  const [collapsedAnswers, setCollapsedAnswers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"unanswered" | "answered">("unanswered");
  const [userVotes, setUserVotes] = useState<{ [answerId: string]: VoteType }>({});

  const [questions, setQuestions] = useState<QuestionType[]>(mockQuestions);

  const aiSummary = mockAiSummary;

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

  const handleLikeDislike = (questionId: string, answerId: string, type: "like" | "dislike") => {
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
                setUserVotes((prevVotes) => ({ ...prevVotes, [answerId]: null }));
              } else {
                // Remove previous opposite vote if exists
                if (currentVote === "like") likes--;
                if (currentVote === "dislike") dislikes--;
                // Add new vote
                if (type === "like") likes++;
                else dislikes++;
                setUserVotes((prevVotes) => ({ ...prevVotes, [answerId]: type }));
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
          Frequently Asked Questions
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* AI Summary (Mobile) */}
          <div className="lg:hidden">
            <AISummary content={aiSummary} />
          </div>

          {/* Tabs */}
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

          {/* Questions List */}
          <div className="space-y-4 mb-20 lg:mb-6">
            {filteredQuestions.length === 0 && (
              <p className="text-sm text-[color:var(--color-muted-foreground)] p-4">
                No {activeTab} questions found.
              </p>
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
                onNewAnswerChange={(value) => handleNewAnswerChange(q.id, value)}
                onSubmitAnswer={() => submitNewAnswer(q.id)}
                onLikeDislike={(answerId, type) => handleLikeDislike(q.id, answerId, type)}
                userVotes={userVotes}
                collapsedAnswers={collapsedAnswers}
                onToggleCollapse={toggleCollapseAnswer}
                replyVisible={replyVisible}
                onToggleReply={toggleReplyField}
                replyInputs={replyInputs}
                onReplyChange={handleReplyChange}
                onSubmitReply={(parentAnswerId) => submitReply(q.id, parentAnswerId)}
                initialVisibleAnswers={3}
                initialVisibleReplies={3}
                maxDepth={3}
              />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:block">
          <AISummary content={aiSummary} />
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

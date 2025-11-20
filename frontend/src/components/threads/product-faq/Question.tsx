"use client";

import React, { useState } from "react";
import { Send, CornerDownRight, MessageSquare, CheckCircle, Clock, Eye } from "lucide-react";
import { Answer as AnswerType } from "./types";
import Answer from "./Answer";
import { getRelativeTime, getRoleBadge, formatCount } from "./utils";

interface QuestionProps {
  id: string;
  question: string;
  description: string;
  answers: AnswerType[];
  isExpanded: boolean;
  newAnswerInput: string;
  onToggle: () => void;
  onNewAnswerChange: (value: string) => void;
  onSubmitAnswer: () => void;
  onLikeDislike: (answerId: string, type: "like" | "dislike") => void;
  userVotes: { [answerId: string]: "like" | "dislike" | null };
  collapsedAnswers: Set<string>;
  onToggleCollapse: (answerId: string) => void;
  replyVisible: Set<string>;
  onToggleReply: (answerId: string) => void;
  replyInputs: { [key: string]: string };
  onReplyChange: (answerId: string, value: string) => void;
  onSubmitReply: (parentAnswerId: string) => void;
  initialVisibleAnswers?: number;
  initialVisibleReplies?: number;
  maxDepth?: number;
  createdAt?: string;
  askedBy?: string;
  userRole?: "seller" | "buyer" | "helper" | null;
  lastActivity?: string;
  viewCount?: number;
}

const Question: React.FC<QuestionProps> = ({
  id,
  question,
  description,
  answers,
  isExpanded,
  newAnswerInput,
  onToggle,
  onNewAnswerChange,
  onSubmitAnswer,
  onLikeDislike,
  userVotes,
  collapsedAnswers,
  onToggleCollapse,
  replyVisible,
  onToggleReply,
  replyInputs,
  onReplyChange,
  onSubmitReply,
  initialVisibleAnswers = 3,
  initialVisibleReplies = 3,
  maxDepth = 5,
  createdAt,
  askedBy,
  userRole,
  lastActivity,
  viewCount,
}) => {
  const [visibleAnswersCount, setVisibleAnswersCount] = useState(initialVisibleAnswers);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const totalAnswers = answers.length;
  const answersToShow = showAllAnswers
    ? answers
    : answers.slice(0, visibleAnswersCount);

  const remainingAnswers = totalAnswers - answersToShow.length;
  const hasMoreAnswers = remainingAnswers > 0;

  const loadMoreAnswers = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = Math.min(visibleAnswersCount + 5, totalAnswers);
    setVisibleAnswersCount(newCount);

    if (newCount >= totalAnswers) {
      setShowAllAnswers(true);
    }
  };

  const showAllAnswersHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAllAnswers(true);
    setVisibleAnswersCount(totalAnswers);
  };

  const hasAcceptedAnswer = answers.some((a) => a.isAccepted);
  const totalReplies = answers.reduce(
    (acc, answer) => acc + (answer.replies?.length || 0),
    0
  );
  const roleBadge = getRoleBadge(userRole);

  return (
    <div
      className={`bg-[color:var(--color-card)] border-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
        isExpanded
          ? "border-[color:var(--color-primary-400)]"
          : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary-200)]"
      } ${hasAcceptedAnswer ? "ring-2 ring-green-500/20" : ""}`}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer transition-colors relative overflow-hidden group"
        onClick={onToggle}
      >
        {/* Status indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          hasAcceptedAnswer
            ? "bg-gradient-to-b from-green-500 to-green-600"
            : totalAnswers > 0
              ? "bg-gradient-to-b from-blue-500 to-blue-600"
              : "bg-gradient-to-b from-yellow-500 to-orange-500"
        }`} />

        <div className="flex-grow ml-2">
          {/* Top metadata bar */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {hasAcceptedAnswer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                <CheckCircle className="h-3 w-3" />
                Solved
              </span>
            )}
            {!hasAcceptedAnswer && totalAnswers === 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium">
                <MessageSquare className="h-3 w-3" />
                Unanswered
              </span>
            )}
            {askedBy && (
              <span className="text-xs text-[color:var(--color-muted-foreground)]">
                Asked by <span className="font-medium text-[color:var(--color-primary-700)]">{askedBy}</span>
              </span>
            )}
            {roleBadge && (
              <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${roleBadge.color}`}>
                {roleBadge.text}
              </span>
            )}
          </div>

          {/* Question title */}
          <h3 className="font-semibold text-[color:var(--color-primary-800)] text-lg group-hover:text-[color:var(--color-primary-600)] transition-colors">
            {question}
          </h3>

          {description && (
            <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1 line-clamp-2">
              {description}
            </p>
          )}

          {/* Bottom metadata bar */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[color:var(--color-muted-foreground)]">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium">{totalAnswers}</span>
              <span>{totalAnswers === 1 ? "answer" : "answers"}</span>
              {totalReplies > 0 && (
                <span className="text-[color:var(--color-muted-foreground)]">
                  · {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
                </span>
              )}
            </div>

            {viewCount !== undefined && viewCount > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{formatCount(viewCount)} views</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{getRelativeTime(lastActivity || createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="border-t-2 border-[color:var(--color-primary-200)] bg-gradient-to-b from-[color:var(--color-primary-50)] to-transparent p-4 space-y-4">
          {/* New Answer Input - Only show if no answers yet */}
          {answers.length === 0 && (
            <div className="relative flex items-center bg-white rounded-lg shadow-sm border border-[color:var(--color-border)] p-1">
              <input
                type="text"
                placeholder="Write your answer..."
                className="flex-grow p-3 pr-12 bg-transparent border-0 focus:outline-none focus:ring-0"
                value={newAnswerInput}
                onChange={(e) => onNewAnswerChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSubmitAnswer();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmitAnswer();
                }}
                disabled={!newAnswerInput?.trim()}
                className="mr-2 p-2.5 rounded-lg bg-gradient-to-r from-[#f5cb5c] to-[#8a9256] text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Scrollable Answers Container */}
          <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2">
            {answersToShow.length > 0 ? (
              <>
                {answersToShow.map((answer) => (
                  <Answer
                    key={answer.id}
                    questionId={id}
                    answer={answer}
                    depth={0}
                    userVote={userVotes[answer.id] || null}
                    isCollapsed={collapsedAnswers.has(answer.id)}
                    isReplyVisible={replyVisible.has(answer.id)}
                    replyInput={replyInputs[answer.id] || ""}
                    onLikeDislike={onLikeDislike}
                    onToggleCollapse={onToggleCollapse}
                    onToggleReply={onToggleReply}
                    onReplyChange={onReplyChange}
                    onSubmitReply={onSubmitReply}
                    userVotes={userVotes}
                    collapsedAnswers={collapsedAnswers}
                    replyVisible={replyVisible}
                    replyInputs={replyInputs}
                    maxDepth={maxDepth}
                    initialVisibleReplies={initialVisibleReplies}
                  />
                ))}

                {/* Load More Answers */}
                {hasMoreAnswers && (
                  <div className="pt-2 pb-2">
                    <button
                      onClick={loadMoreAnswers}
                      className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-primary-700)] hover:text-[color:var(--color-primary-800)] hover:underline"
                    >
                      <CornerDownRight className="h-4 w-4" />
                      Load {remainingAnswers} more{" "}
                      {remainingAnswers === 1 ? "answer" : "answers"}
                    </button>

                    {remainingAnswers > 5 && (
                      <button
                        onClick={showAllAnswersHandler}
                        className="ml-6 text-xs text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary-700)] hover:underline"
                      >
                        Show all {totalAnswers} answers
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[color:var(--color-muted-foreground)] italic">
                No answers yet. Be the first to answer!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;

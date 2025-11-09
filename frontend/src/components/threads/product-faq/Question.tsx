"use client";

import React, { useState } from "react";
import { Send, CornerDownRight } from "lucide-react";
import { Answer as AnswerType } from "./types";
import Answer from "./Answer";

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

  return (
    <div className="bg-[color:var(--color-card)] border border-[color:var(--color-border)] rounded-lg shadow-sm">
      {/* Header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-secondary-subtle transition-colors"
        onClick={onToggle}
      >
        <div className="flex-grow">
          <h3 className="font-medium text-[color:var(--color-primary-800)]">
            {question}
          </h3>
          <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1">
            {description}
          </p>
          {totalAnswers > 0 && (
            <p className="text-xs text-[color:var(--color-primary-600)] mt-2">
              {totalAnswers} {totalAnswers === 1 ? "answer" : "answers"}
            </p>
          )}
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="border-t border-[color:var(--color-border)] p-4 space-y-4">
          {/* New Answer Input - Only show if no answers yet */}
          {answers.length === 0 && (
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Write your answer..."
                className="flex-grow p-3 pr-12 rounded-full border border-[color:var(--color-border)]"
                value={newAnswerInput}
                onChange={(e) => onNewAnswerChange(e.target.value)}
                onKeyPress={(e) => {
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
                className="absolute right-2 p-2 rounded-full bg-accent-gradient text-white hover:opacity-90 disabled:opacity-50"
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

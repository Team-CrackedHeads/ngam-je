"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  CornerDownRight,
} from "lucide-react";
import { Answer as AnswerType } from "./types";

interface AnswerProps {
  questionId: string;
  answer: AnswerType;
  depth: number;
  userVote: "like" | "dislike" | null;
  isCollapsed: boolean;
  isReplyVisible: boolean;
  replyInput: string;
  onLikeDislike: (answerId: string, type: "like" | "dislike") => void;
  onToggleCollapse: (answerId: string) => void;
  onToggleReply: (answerId: string) => void;
  onReplyChange: (answerId: string, value: string) => void;
  onSubmitReply: (parentAnswerId: string) => void;
  userVotes: { [answerId: string]: "like" | "dislike" | null };
  collapsedAnswers: Set<string>;
  replyVisible: Set<string>;
  replyInputs: { [key: string]: string };
  maxDepth?: number;
  initialVisibleReplies?: number;
}

const Answer: React.FC<AnswerProps> = ({
  questionId,
  answer,
  depth,
  userVote,
  isCollapsed,
  isReplyVisible,
  replyInput,
  onLikeDislike,
  onToggleCollapse,
  onToggleReply,
  onReplyChange,
  onSubmitReply,
  userVotes,
  collapsedAnswers,
  replyVisible,
  replyInputs,
  maxDepth = 5,
  initialVisibleReplies = 3,
}) => {
  // Each answer/reply manages its own visible nested replies count
  const [visibleRepliesCount, setVisibleRepliesCount] = useState(initialVisibleReplies);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const totalReplies = answer.replies?.length || 0;
  const shouldShowContinueThread = depth >= maxDepth && totalReplies > 0;

  // Determine which replies to show
  const repliesToShow = showAllReplies 
    ? answer.replies || []
    : (answer.replies || []).slice(0, visibleRepliesCount);

  const remainingReplies = totalReplies - repliesToShow.length;
  const hasMoreReplies = remainingReplies > 0;

  const loadMoreReplies = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = Math.min(visibleRepliesCount + 3, totalReplies);
    setVisibleRepliesCount(newCount);
    
    if (newCount >= totalReplies) {
      setShowAllReplies(true);
    }
  };

  const showAllRepliesHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAllReplies(true);
    setVisibleRepliesCount(totalReplies);
  };

  return (
    <div className="relative">
      {/* Thread line */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 border-l-2 border-[color:var(--color-border)]"
          style={{ marginLeft: `${(depth - 1) * 16 + 8}px` }}
        />
      )}

      <div
        className="bg-[color:var(--color-secondary-50)] p-3 rounded-md relative"
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => onToggleCollapse(answer.id)}
          >
            {isCollapsed ? (
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
                userVote === "like"
                  ? "bg-[color:var(--color-primary-600)] text-white"
                  : "bg-[color:var(--color-secondary-100)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-secondary-200)]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLikeDislike(answer.id, "like");
              }}
            >
              <ThumbsUp className="h-4 w-4" /> {answer.likes ?? 0}
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                userVote === "dislike"
                  ? "bg-[color:var(--color-primary-600)] text-white"
                  : "bg-[color:var(--color-secondary-100)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-secondary-200)]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLikeDislike(answer.id, "dislike");
              }}
            >
              <ThumbsDown className="h-4 w-4" /> {answer.dislikes ?? 0}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1">
              {answer.text}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReply(answer.id);
                }}
                className="text-sm text-[color:var(--color-primary-700)] hover:underline flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                Reply
              </button>

              {totalReplies > 0 && (
                <span className="text-xs text-[color:var(--color-muted-foreground)]">
                  {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
                </span>
              )}
            </div>

            {isReplyVisible && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Reply..."
                  className="flex-grow p-2 rounded-lg border border-[color:var(--color-border)] text-sm"
                  value={replyInput}
                  onChange={(e) => onReplyChange(answer.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSubmitReply(answer.id);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubmitReply(answer.id);
                  }}
                  className="p-2 rounded-md bg-[color:var(--color-primary-700)] text-white hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Render nested replies */}
            {!shouldShowContinueThread && repliesToShow.length > 0 && (
              <div className="mt-2 space-y-2">
                {repliesToShow.map((reply) => (
                  <Answer
                    key={reply.id}
                    questionId={questionId}
                    answer={reply}
                    depth={depth + 1}
                    userVote={userVotes[reply.id] || null}
                    isCollapsed={collapsedAnswers.has(reply.id)}
                    isReplyVisible={replyVisible.has(reply.id)}
                    replyInput={replyInputs[reply.id] || ""}
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

                {/* Load More Replies Button */}
                {hasMoreReplies && (
                  <div 
                    className="mt-2"
                    style={{ marginLeft: `${(depth + 1) * 16}px` }}
                  >
                    <button
                      onClick={loadMoreReplies}
                      className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-primary-700)] hover:text-[color:var(--color-primary-800)] hover:underline"
                    >
                      <CornerDownRight className="h-4 w-4" />
                      Load {remainingReplies} more {remainingReplies === 1 ? "reply" : "replies"}
                    </button>
                    
                    {/* Optional: Show all at once */}
                    {remainingReplies > 3 && (
                      <button
                        onClick={showAllRepliesHandler}
                        className="ml-6 text-xs text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary-700)] hover:underline"
                      >
                        Show all {totalReplies} replies
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Continue Thread Button (for deep nesting) */}
            {shouldShowContinueThread && (
              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // You can implement a modal or navigate to a dedicated thread page
                    console.log("Continue thread for answer:", answer.id);
                    alert(`This would open a dedicated page for this deeply nested thread with ${totalReplies} replies`);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[color:var(--color-muted-foreground)] border border-dashed border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-secondary-100)] transition-colors"
                >
                  <CornerDownRight className="h-3 w-3" />
                  Continue this thread ({totalReplies} more {totalReplies === 1 ? "reply" : "replies"})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Answer;
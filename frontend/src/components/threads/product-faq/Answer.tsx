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
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Answer as AnswerType } from "./types";
import { getRelativeTime, getRoleBadge } from "./utils";

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

  const roleBadge = getRoleBadge(answer.userRole);

  return (
    <div className="relative">
      {/* Thread line - Enhanced Discord style */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[color:var(--color-primary-300)] to-[color:var(--color-border)]"
          style={{ marginLeft: `${(depth - 1) * 16 + 8}px` }}
        />
      )}

      <div
        className={`p-4 rounded-lg relative transition-all duration-200 ${
          depth === 0
            ? "bg-white border-2 border-[color:var(--color-border)] shadow-sm hover:shadow-md"
            : "bg-[color:var(--color-secondary-50)] border border-[color:var(--color-border)]"
        } ${answer.isAccepted ? "ring-2 ring-green-500/30 border-green-300" : ""}`}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        {/* Accepted Answer Badge */}
        {answer.isAccepted && (
          <div className="absolute -top-2 left-4 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Best Answer
          </div>
        )}

        <div className="flex justify-between items-start gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
            onClick={() => onToggleCollapse(answer.id)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-[color:var(--color-muted-foreground)] flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[color:var(--color-muted-foreground)] flex-shrink-0" />
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[color:var(--color-primary-800)]">
                {answer.user}
              </p>
              {roleBadge && (
                <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${roleBadge.color}`}>
                  {roleBadge.text}
                </span>
              )}
              <span className="text-xs text-[color:var(--color-muted-foreground)] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getRelativeTime(answer.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                userVote === "like"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                  : "bg-[color:var(--color-secondary-100)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-secondary-200)] hover:text-blue-600"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLikeDislike(answer.id, "like");
              }}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="font-semibold">{answer.likes ?? 0}</span>
            </button>
            <button
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                userVote === "dislike"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"
                  : "bg-[color:var(--color-secondary-100)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-secondary-200)] hover:text-red-600"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLikeDislike(answer.id, "dislike");
              }}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="font-semibold">{answer.dislikes ?? 0}</span>
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <p className="text-sm text-[color:var(--color-foreground)] mt-3 leading-relaxed whitespace-pre-wrap bg-[color:var(--color-primary-50)] p-3 rounded-lg border-l-4 border-[color:var(--color-primary-400)]">
              {answer.text}
            </p>

            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[color:var(--color-border)]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReply(answer.id);
                }}
                className="text-xs font-medium text-[color:var(--color-primary-700)] hover:bg-[color:var(--color-primary-100)] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </button>

              {totalReplies > 0 && (
                <span className="text-xs text-[color:var(--color-muted-foreground)] font-medium">
                  {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
                </span>
              )}
            </div>

            {isReplyVisible && (
              <div className="flex items-center gap-2 mt-3 bg-white rounded-lg shadow-sm border border-[color:var(--color-border)] p-1">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="flex-grow p-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm"
                  value={replyInput}
                  onChange={(e) => onReplyChange(answer.id, e.target.value)}
                  onKeyDown={(e) => {
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
                  className="mr-1 p-2 rounded-lg bg-gradient-to-r from-[#f5cb5c] to-[#8a9256] text-white hover:shadow-md transition-all"
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
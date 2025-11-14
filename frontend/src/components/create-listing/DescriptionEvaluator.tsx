'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { ChecklistItem, EvaluationResult } from '@/hooks/use-description-evaluator';

interface DescriptionEvaluatorProps {
  evaluation: EvaluationResult | null;
  isEvaluating: boolean;
  error: string | null;
}

export default function DescriptionEvaluator({ evaluation, isEvaluating, error }: DescriptionEvaluatorProps) {
  if (error) {
    return (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">⚠️ {error}</p>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <p className="text-sm text-blue-700">Evaluating description...</p>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBgColor = (score: number) => {
    if (score < 40) return 'bg-red-50 border-red-200';
    if (score < 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className={`mt-3 p-4 border rounded-lg ${getBgColor(evaluation.score)}`}>
      {/* Score */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700">Quality Score</p>
        <p className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
          {evaluation.score}%
        </p>
      </div>

      {/* Checklist */}
      {evaluation.checklist.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Checklist</p>
          <div className="space-y-1">
            {evaluation.checklist.map((item, idx) => (
              <ChecklistItemComponent key={idx} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {evaluation.suggestions.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-700 mb-1">💡 Suggestions</p>
          <ul className="text-sm text-gray-700 space-y-1">
            {evaluation.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-gray-400">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Title */}
      {evaluation.suggested_title && (
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-600 mb-1">✨ Suggested Title:</p>
          <p className="text-sm text-gray-800 italic">"{evaluation.suggested_title}"</p>
        </div>
      )}

      {/* Suggested Tags */}
      {evaluation.suggested_tags.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">🏷️ Suggested Tags:</p>
          <div className="flex flex-wrap gap-1">
            {evaluation.suggested_tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistItemComponent({ item }: { item: ChecklistItem }) {
  const getIcon = () => {
    switch (item.status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getTextColor = () => {
    switch (item.status) {
      case 'pass':
        return 'text-green-700';
      case 'fail':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
    }
  };

  return (
    <div className="flex items-start gap-2">
      {getIcon()}
      <div className="flex-1">
        <p className={`text-sm font-medium ${getTextColor()}`}>{item.label}</p>
        <p className="text-xs text-gray-600">{item.message}</p>
      </div>
    </div>
  );
}

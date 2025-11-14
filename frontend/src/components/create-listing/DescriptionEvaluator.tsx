'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Lightbulb, Gauge, ClipboardList } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChecklistItem, EvaluationResult } from '@/hooks/use-description-evaluator';

interface DescriptionEvaluatorProps {
  evaluation: EvaluationResult | null;
  isEvaluating: boolean;
  error: string | null;
}

export default function DescriptionEvaluator({ evaluation, isEvaluating, error }: DescriptionEvaluatorProps) {
  if (error) {
    return (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="mt-3 p-3 bg-[var(--color-primary-100)] border border-[var(--color-primary-300)] rounded-lg flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary-700)]" />
        <p className="text-sm text-[var(--color-primary-800)]">Evaluating description...</p>
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
    <div className={`mt-3 p-4 border rounded-lg ${getBgColor(evaluation.completeness_score)}`}>
      {/* Score */}
      <div className="mb-3">
        <p className="text-base font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Gauge className="w-5 h-5" />
          Completeness Score
        </p>
        <p className={`text-2xl font-bold ${getScoreColor(evaluation.completeness_score)}`}>
          {evaluation.completeness_score}%
        </p>
      </div>

      {/* Checklist */}
      {evaluation.checklist.length > 0 && (
        <div className="mb-3">
          <p className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5" />
            Checklist
          </p>
          <div className="space-y-1">
            {evaluation.checklist.map((item, idx) => (
              <ChecklistItemComponent key={idx} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {evaluation.suggestions.length > 0 && (
        <div>
          <p className="text-base font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-5 h-5" />
            Suggestions
          </p>
          <ul className="text-sm text-gray-700 space-y-2">
            {evaluation.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <div className="flex-1 prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span className="inline">{children}</span>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children }) => <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">{children}</code>,
                    }}
                  >
                    {suggestion}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
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
    <div className="flex items-center gap-2">
      {getIcon()}
      <div className="flex-1">
        <p className={`text-sm font-medium ${getTextColor()}`}>{item.label}</p>
        <p className="text-xs text-gray-600">{item.message}</p>
      </div>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

export interface ChecklistItem {
  status: 'pass' | 'fail' | 'warning';
  label: string;
  message: string;
}

export interface EvaluationResult {
  score: number;
  checklist: ChecklistItem[];
  suggestions: string[];
  suggested_title: string;
  suggested_tags: string[];
}

interface UseDescriptionEvaluatorOptions {
  listingType: 'buy' | 'sell';
  debounceMs?: number;
  minChars?: number;
}

export function useDescriptionEvaluator(options: UseDescriptionEvaluatorOptions) {
  const { listingType, debounceMs = 1500, minChars = 10 } = options;

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const evaluateText = useCallback(async (text: string) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset if text is too short
    if (text.length < minChars) {
      setEvaluation(null);
      setIsEvaluating(false);
      setError(null);
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      const response = await axios.post(
        '/api/v1/generation/evaluate-description',
        {
          text: text,
          listing_type: listingType,
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );

      setEvaluation(response.data);
    } catch (err: any) {
      if (axios.isCancel(err)) {
        return;
      }
      console.error('Evaluation error:', err);
      setError(err.response?.data?.detail || 'Failed to evaluate description');
    } finally {
      setIsEvaluating(false);
    }
  }, [listingType, minChars]);

  const debouncedEvaluate = useCallback((text: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      evaluateText(text);
    }, debounceMs);
  }, [evaluateText, debounceMs]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    evaluation,
    isEvaluating,
    error,
    evaluate: debouncedEvaluate,
  };
}

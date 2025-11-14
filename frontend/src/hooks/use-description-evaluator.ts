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
    console.log('🔍 evaluateText called with:', { textLength: text.length, minChars });

    // Cancel any pending request
    if (abortControllerRef.current) {
      console.log('❌ Aborting previous request');
      abortControllerRef.current.abort();
    }

    // Reset if text is too short
    if (text.length < minChars) {
      console.log('⚠️ Text too short, skipping evaluation');
      setEvaluation(null);
      setIsEvaluating(false);
      setError(null);
      return;
    }

    console.log('✅ Starting evaluation...');
    setIsEvaluating(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/generation/evaluate-description`;
      console.log('📡 Sending request to:', url);

      const response = await axios.post(
        url,
        {
          text: text,
          listing_type: listingType,
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );

      console.log('✅ Evaluation response:', response.data);
      setEvaluation(response.data);
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log('🚫 Request cancelled');
        return;
      }
      console.error('❌ Evaluation error:', err);
      setError(err.response?.data?.detail || 'Failed to evaluate description');
    } finally {
      setIsEvaluating(false);
    }
  }, [listingType, minChars]);

  const debouncedEvaluate = useCallback((text: string) => {
    console.log('⏱️ debouncedEvaluate called, debounce:', debounceMs, 'ms');

    if (debounceTimerRef.current) {
      console.log('🔄 Clearing previous debounce timer');
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      console.log('⏰ Debounce timer fired, evaluating now...');
      evaluateText(text);
    }, debounceMs);
  }, [evaluateText, debounceMs]);

  const reset = useCallback(() => {
    console.log('🔄 Resetting evaluation state');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setEvaluation(null);
    setIsEvaluating(false);
    setError(null);
  }, []);

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
    reset,
  };
}

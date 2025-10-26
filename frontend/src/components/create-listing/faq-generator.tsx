'use client';

import React from 'react';
import { HelpCircle, Plus, Loader2, Sparkles, Trash2, Save, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQGeneratorProps {
  faqs: FAQ[];
  onFAQsChange: (faqs: FAQ[]) => void;
  hasAnyInput?: boolean;
  mockFAQData?: FAQ[];
  answerOnlyMode?: boolean;
  questionOnlyMode?: boolean; // For Create Listing - only add questions
}

export default function FAQGenerator({ faqs, onFAQsChange, hasAnyInput = true, mockFAQData = [], answerOnlyMode = false, questionOnlyMode = false }: FAQGeneratorProps) {
  const DRAFT_STORAGE_KEY = 'faq-generator-question-only-drafts-v1';

  const generateId = React.useCallback(() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const getDraftStorageKey = React.useCallback(() => {
    if (typeof window === 'undefined') {
      return DRAFT_STORAGE_KEY;
    }

    return `${DRAFT_STORAGE_KEY}:${window.location.pathname}`;
  }, []);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [savedQuestions, setSavedQuestions] = React.useState<Record<string, boolean>>({});
  const [draftOrder, setDraftOrder] = React.useState<string[]>([]);
  const [draftValues, setDraftValues] = React.useState<Record<string, string>>({});
  const [draftPositions, setDraftPositions] = React.useState<Record<string, number>>({});
  const hasRestoredDraftsRef = React.useRef(false);

  // console.log('FAQGenerator modes:', { answerOnlyMode, questionOnlyMode });

  const createEmptyFAQ = (): FAQ => ({
    id: generateId(),
    question: '',
    answer: ''
  });

  const addFAQ = () => {
    if (questionOnlyMode) {
      const newFAQ = createEmptyFAQ();
      setDraftOrder(prev => {
        const next = [...prev, newFAQ.id];
        setDraftPositions(current => ({ ...current, [newFAQ.id]: faqs.length + prev.length + 1.5 }));
        return next;
      });
      setDraftValues(prev => ({ ...prev, [newFAQ.id]: '' }));
      setSavedQuestions(prev => ({ ...prev, [newFAQ.id]: false }));
      return;
    }

    const newFAQ = createEmptyFAQ();
    onFAQsChange([...faqs, newFAQ]);
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    if (questionOnlyMode && field === 'question') {
      setDraftValues(prev => ({ ...prev, [id]: value }));
      return;
    }

    const updatedFAQs = faqs.map(faq =>
      faq.id === id ? { ...faq, [field]: value } : faq
    );
    onFAQsChange(updatedFAQs);
  };

  const removeFAQ = (id: string) => {
    if (questionOnlyMode) {
      const isSaved = faqs.some(faq => faq.id === id);
      if (isSaved) {
        const filteredFAQs = faqs.filter(faq => faq.id !== id);
        onFAQsChange(filteredFAQs);
      }

      setDraftOrder(prev => prev.filter(draftId => draftId !== id));
      setDraftValues(prev => {
        if (!(id in prev)) return prev;
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setSavedQuestions(prev => {
        if (!(id in prev)) return prev;
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setDraftPositions(prev => {
        if (!(id in prev)) return prev;
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      return;
    }

    const filteredFAQs = faqs.filter(faq => faq.id !== id);
    onFAQsChange(filteredFAQs);
  };

  const generateFAQsWithAI = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    onFAQsChange([...faqs, ...mockFAQData]);
    setIsGenerating(false);
  };

  React.useEffect(() => {
    if (!questionOnlyMode) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (hasRestoredDraftsRef.current) {
      return;
    }

    const storageKey = getDraftStorageKey();
    const stored = sessionStorage.getItem(storageKey);

    if (!stored) {
      hasRestoredDraftsRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      const order = Array.isArray(parsed?.order)
        ? parsed.order.filter((id: unknown): id is string => typeof id === 'string')
        : [];

      const values = parsed?.values && typeof parsed.values === 'object' && parsed.values !== null
        ? parsed.values as Record<string, string>
        : {};

      const positions = parsed?.positions && typeof parsed.positions === 'object' && parsed.positions !== null
        ? parsed.positions as Record<string, number>
        : {};

      if (order.length > 0 || Object.keys(values).length > 0) {
        setDraftOrder(order);
        setDraftValues(values);
        setDraftPositions(positions);
        setSavedQuestions(prev => {
          const next = { ...prev };
          order.forEach(id => {
            next[id] = false;
          });
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to restore question drafts', error);
      sessionStorage.removeItem(storageKey);
    } finally {
      hasRestoredDraftsRef.current = true;
    }
  }, [questionOnlyMode, getDraftStorageKey]);

  React.useEffect(() => {
    if (!questionOnlyMode) {
      return;
    }

    if (!hasRestoredDraftsRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = getDraftStorageKey();

    if (draftOrder.length === 0) {
      sessionStorage.removeItem(storageKey);
      return;
    }

    const filteredValues: Record<string, string> = {};
    const filteredPositions: Record<string, number> = {};

    draftOrder.forEach(id => {
      if (id in draftValues) {
        filteredValues[id] = draftValues[id];
      }
      if (id in draftPositions) {
        filteredPositions[id] = draftPositions[id];
      }
    });

    const payload = JSON.stringify({
      order: draftOrder,
      values: filteredValues,
      positions: filteredPositions
    });

    sessionStorage.setItem(storageKey, payload);
  }, [questionOnlyMode, draftOrder, draftValues, draftPositions, getDraftStorageKey]);

  React.useEffect(() => {
    if (questionOnlyMode) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = getDraftStorageKey();
    sessionStorage.removeItem(storageKey);
  }, [questionOnlyMode, getDraftStorageKey]);

  const handleQuestionSave = (faqId: string) => {
    if (!questionOnlyMode) {
      return;
    }

    const existingFaq = faqs.find(faq => faq.id === faqId);
    const currentValue = draftValues[faqId] ?? existingFaq?.question ?? '';
    const trimmedQuestion = currentValue.trim();
    if (!trimmedQuestion) {
      return;
    }

    const existingIndex = faqs.findIndex(faq => faq.id === faqId);
    if (existingIndex !== -1) {
      const updatedFAQs = faqs.map(faq =>
        faq.id === faqId ? { ...faq, question: trimmedQuestion } : faq
      );
      onFAQsChange(updatedFAQs);
    } else {
      const newFAQ: FAQ = { id: faqId, question: trimmedQuestion, answer: '' };
      const positionHint = draftPositions[faqId];
      const insertIndex = typeof positionHint === 'number'
        ? Math.min(faqs.length, Math.max(0, Math.floor(positionHint)))
        : faqs.length;
      const nextFAQs = [...faqs];
      nextFAQs.splice(insertIndex, 0, newFAQ);
      onFAQsChange(nextFAQs);
    }

    setSavedQuestions(prev => ({ ...prev, [faqId]: true }));
    setDraftValues(prev => {
      if (!(faqId in prev)) {
        return prev;
      }
      const { [faqId]: _, ...rest } = prev;
      return rest;
    });
    setDraftOrder(prev => prev.filter(id => id !== faqId));
    setDraftPositions(prev => {
      if (!(faqId in prev)) {
        return prev;
      }
      const { [faqId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleQuestionEdit = (faqId: string) => {
    const existingIndex = faqs.findIndex(faq => faq.id === faqId);
    if (existingIndex !== -1) {
      const existing = faqs[existingIndex];
      setDraftValues(prev => ({ ...prev, [faqId]: existing.question }));
      const nextFAQs = [...faqs];
      nextFAQs.splice(existingIndex, 1);
      onFAQsChange(nextFAQs);
      setDraftPositions(prev => ({ ...prev, [faqId]: existingIndex + 0.5 }));
    }

    setSavedQuestions(prev => ({ ...prev, [faqId]: false }));
    setDraftOrder(prev => {
      const filtered = prev.filter(id => id !== faqId);
      return [...filtered, faqId];
    });
  };

  React.useEffect(() => {
    setSavedQuestions(prev => {
      let changed = false;
      const next: Record<string, boolean> = { ...prev };
      const savedIds = new Set(faqs.map(faq => faq.id));

      Object.keys(next).forEach(id => {
        if (!savedIds.has(id) && !draftOrder.includes(id)) {
          delete next[id];
          changed = true;
        }
      });

      faqs.forEach(faq => {
        if (!(faq.id in next)) {
          next[faq.id] = true;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [faqs, draftOrder]);

  React.useEffect(() => {
    if (!questionOnlyMode) {
      return;
    }

    const savedIds = new Set(faqs.map(faq => faq.id));

    setDraftOrder(prev => {
      const filtered = prev.filter(id => !savedIds.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });

    setDraftValues(prev => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach(id => {
        if (savedIds.has(id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    setDraftPositions(prev => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach(id => {
        if (savedIds.has(id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [faqs, questionOnlyMode]);

  const displayedRows = React.useMemo(() => {
    if (!questionOnlyMode) {
      return faqs.map((faq, index) => ({ faq, isSaved: true, position: index + 1 }));
    }

    const savedRows = faqs.map((faq, index) => ({ faq, isSaved: true, position: index + 1 }));

    const draftRows = draftOrder.map((id, orderIndex) => {
      const position = draftPositions[id] ?? (faqs.length + orderIndex + 1.5);
      const questionValue = draftValues[id] ?? '';
      return {
        faq: { id, question: questionValue, answer: '' },
        isSaved: savedQuestions[id] ?? false,
        position
      };
    });

    const combined = [...savedRows, ...draftRows];
    combined.sort((a, b) => a.position - b.position);
    return combined;
  }, [questionOnlyMode, faqs, draftOrder, draftPositions, draftValues, savedQuestions]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">
          {answerOnlyMode ? 'Answer Questions' : questionOnlyMode ? 'Add Questions' : 'Frequently Asked Questions'}
        </h2>
        <p className="text-lg text-[var(--color-primary-900)]">
          {answerOnlyMode
            ? 'Please answer the questions from the original poster'
            : questionOnlyMode
            ? 'Add questions you want answered'
            : 'Help sellers understand your requirements better'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {displayedRows.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-[var(--color-primary-50)]">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)]" />
            <p className="text-[var(--color-primary-900)] mb-2 font-medium">
              {questionOnlyMode ? 'No questions added yet' : 'No FAQs added yet'}
            </p>
            <p className="text-sm text-[var(--color-primary-700)] mb-4">
              {questionOnlyMode
                ? 'Add questions you want answered'
                : 'Add common questions sellers might have about your requirements'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedRows.map(({ faq, isSaved }, index) => {
              const trimmedQuestion = faq.question.trim();

              const headerLabel = questionOnlyMode
                ? (isSaved && trimmedQuestion ? trimmedQuestion : 'Question')
                : answerOnlyMode
                ? 'Question'
                : 'Question & Answer';

              return (
                <Card
                  key={faq.id}
                  className="border-2 border-[var(--color-primary-300)] rounded-xl flex flex-col gap-0 py-0"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-secondary-500)] text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <Label className="text-base font-medium text-[var(--color-accent-700)]">
                          {headerLabel}
                        </Label>
                      </div>
                      {!answerOnlyMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFAQ(faq.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4 px-6 pb-6">
                      <div>
                        {!questionOnlyMode && (
                          <Label htmlFor={`question-${faq.id}`} className="text-sm text-[var(--color-primary-900)] mb-2 block">
                            Question
                          </Label>
                        )}
                        {answerOnlyMode ? (
                          <div className="text-base p-3 bg-[var(--color-primary-100)] rounded-lg border border-[var(--color-primary-200)] text-[var(--color-accent-700)]">
                            {faq.question}
                          </div>
                        ) : (
                          questionOnlyMode ? (
                            <div className="flex items-center gap-3">
                              {!isSaved && (
                                <Input
                                  id={`question-${faq.id}`}
                                  value={faq.question}
                                  onChange={(e) => {
                                    updateFAQ(faq.id, 'question', e.target.value);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isSaved) {
                                      e.preventDefault();
                                      handleQuestionSave(faq.id);
                                    }
                                  }}
                                  placeholder="e.g., What condition are you looking for?"
                                  className="flex-1 text-base border-[var(--color-primary-200)]"
                                  aria-label="Question"
                                />
                              )}
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => (isSaved ? handleQuestionEdit(faq.id) : handleQuestionSave(faq.id))}
                                disabled={!isSaved && !trimmedQuestion}
                                className={`flex items-center gap-2 shadow-md ${
                                  isSaved
                                    ? 'bg-[var(--color-primary-100)] hover:bg-[var(--color-primary-200)] text-[var(--color-accent-700)]'
                                    : 'bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-white'
                                } ${isSaved ? 'ml-auto' : ''}`}
                                aria-label={isSaved ? 'Edit question' : 'Save question'}
                              >
                                {isSaved ? (
                                  <>
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    Save
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Input
                              id={`question-${faq.id}`}
                              value={faq.question}
                              onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                              placeholder="e.g., What condition are you looking for?"
                              className="text-base border-[var(--color-primary-200)]"
                            />
                          )
                        )}
                      </div>

                      {!questionOnlyMode && (
                        <div>
                          <Label htmlFor={`answer-${faq.id}`} className="text-sm text-[var(--color-primary-900)] mb-2 block">
                            Answer
                          </Label>
                          <Textarea
                            id={`answer-${faq.id}`}
                            value={faq.answer}
                            onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                            placeholder="Provide a detailed answer..."
                            className="text-base min-h-[100px] border-[var(--color-primary-200)]"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!answerOnlyMode && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-[var(--color-primary-300)] text-[var(--color-accent-700)]"
              onClick={addFAQ}
            >
              <Plus className="w-4 h-4 mr-2" />
              {questionOnlyMode ? 'Add Question Manually' : 'Add FAQ Manually'}
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs sm:text-sm bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-[var(--color-accent-700)] border-0 shadow-md"
              onClick={generateFAQsWithAI}
              disabled={isGenerating || !hasAnyInput}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-[var(--color-secondary-900)]" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 text-[var(--color-secondary-900)]" />
                  {questionOnlyMode ? 'Generate Questions with AI' : 'Generate FAQs with AI'}
                </>
              )}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

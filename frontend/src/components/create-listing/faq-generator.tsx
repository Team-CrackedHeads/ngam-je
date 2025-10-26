'use client';

import React from 'react';
import { HelpCircle, Plus, Loader2, Sparkles, Trash2, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isGenerating, setIsGenerating] = React.useState(false);

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    onFAQsChange([...faqs, newFAQ]);
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    const updatedFAQs = faqs.map(faq =>
      faq.id === id ? { ...faq, [field]: value } : faq
    );
    onFAQsChange(updatedFAQs);
  };

  const removeFAQ = (id: string) => {
    const filteredFAQs = faqs.filter(faq => faq.id !== id);
    onFAQsChange(filteredFAQs);
  };

  const generateFAQsWithAI = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    onFAQsChange([...faqs, ...mockFAQData]);
    setIsGenerating(false);
  };

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
            ? 'Add questions you want potential offers to answer'
            : 'Help sellers understand your requirements better'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-[var(--color-primary-50)]">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary-500)]" />
            <p className="text-[var(--color-primary-900)] mb-2 font-medium">
              {questionOnlyMode ? 'No questions added yet' : 'No FAQs added yet'}
            </p>
            <p className="text-sm text-[var(--color-primary-700)] mb-4">
              {questionOnlyMode
                ? 'Add questions you want potential offers to answer'
                : 'Add common questions sellers might have about your requirements'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
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
                        {answerOnlyMode || questionOnlyMode ? 'Question' : 'Question & Answer'}
                      </Label>
                    </div>
                    {!answerOnlyMode && !questionOnlyMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFAQ(faq.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    {questionOnlyMode && (
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
                      <Label htmlFor={`question-${faq.id}`} className="text-sm text-[var(--color-primary-900)] mb-2 block">
                        Question
                      </Label>
                      {answerOnlyMode ? (
                        <div className="text-base p-3 bg-[var(--color-primary-100)] rounded-lg border border-[var(--color-primary-200)] text-[var(--color-accent-700)]">
                          {faq.question}
                        </div>
                      ) : (
                        <Input
                          id={`question-${faq.id}`}
                          value={faq.question}
                          onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                          placeholder="e.g., What condition are you looking for?"
                          className="text-base border-[var(--color-primary-200)]"
                        />
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
            ))}
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

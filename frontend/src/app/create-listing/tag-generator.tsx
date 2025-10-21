'use client';

import React, { useState } from 'react';
import { Tag, X, Plus, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { databaseTags, suggestedTags } from '@/utils/mock-tag-data';

// Editable Tag Component
function EditableTag({ tag, onRemove, onEdit }: { tag: string; onRemove: (tag: string) => void; onEdit: (oldTag: string, newTag: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tag);

  const handleSave = () => {
    if (editValue.trim() && editValue !== tag) {
      onEdit(tag, editValue);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(tag);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-secondary-500)] border-2 border-[var(--color-secondary-600)]">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          autoFocus
          className="h-6 w-24 px-2 py-0 text-sm border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] border-2 border-[var(--color-secondary-600)] hover:border-[var(--color-secondary-700)] transition-all cursor-pointer group"
      onClick={() => setIsEditing(true)}
    >
      <Tag className="w-3 h-3" />
      <span className="text-sm font-medium">{tag}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tag);
        }}
        className="hover:bg-[var(--color-secondary-600)] rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface TagGeneratorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  hasContent?: boolean;
}

export default function TagGenerator({ tags, onTagsChange, hasContent = true }: TagGeneratorProps) {
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredTagSuggestions, setFilteredTagSuggestions] = useState<string[]>([]);

  const generateTagsFromContent = async () => {
    setIsGeneratingTags(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    onTagsChange(suggestedTags);

    setIsGeneratingTags(false);
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || newTagInput.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      onTagsChange([...tags, tagToAdd]);
      setNewTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleTagInputChange = (value: string) => {
    setNewTagInput(value);

    if (value.trim()) {
      // Filter database tags that match the input and aren't already added
      const filtered = databaseTags.filter(tag =>
        tag.toLowerCase().includes(value.toLowerCase()) &&
        !tags.includes(tag)
      );
      setFilteredTagSuggestions(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setShowTagSuggestions(false);
      setFilteredTagSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const editTag = (oldTag: string, newTag: string) => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange(tags.map(tag => tag === oldTag ? newTag.trim() : tag));
    }
  };

  if (!hasContent) {
    return null;
  }

  return (
    <div className="pt-4 sm:pt-6 border-t-2 border-[var(--color-primary-300)]">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
          Product Category Tags
        </Label>
        {tags.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={generateTagsFromContent}
            disabled={isGeneratingTags}
            className="text-xs sm:text-sm border-[var(--color-secondary-500)] text-[var(--color-accent-700)]"
          >
            {isGeneratingTags ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Generate Tags
              </>
            )}
          </Button>
        )}
      </div>

      {tags.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <EditableTag
                key={index}
                tag={tag}
                onRemove={removeTag}
                onEdit={editTag}
              />
            ))}
          </div>

          <div className="flex gap-2 relative">
            <div className="flex-1 relative">
              <Input
                value={newTagInput}
                onChange={(e) => handleTagInputChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onFocus={() => {
                  if (newTagInput.trim() && filteredTagSuggestions.length > 0) {
                    setShowTagSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow clicking on suggestions
                  setTimeout(() => setShowTagSuggestions(false), 200);
                }}
                placeholder="Add new tag..."
                className="text-sm border-[var(--color-primary-200)]"
              />

              {/* Tag Suggestions Dropdown */}
              {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-[var(--color-secondary-500)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredTagSuggestions.map((tag, index) => (
                    <button
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addTag(tag);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[var(--color-secondary-100)] transition-colors flex items-center gap-2 text-sm"
                    >
                      <Tag className="w-3 h-3 text-[var(--color-secondary-500)]" />
                      <span className="text-[var(--color-accent-700)]">{tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTag()}
              disabled={!newTagInput.trim()}
              className="border-[var(--color-primary-300)]"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={generateTagsFromContent}
            disabled={isGeneratingTags}
            className="text-[var(--color-secondary-600)] hover:text-[var(--color-secondary-700)] p-0"
          >
            {isGeneratingTags ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate Tags with AI
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center bg-[var(--color-primary-50)]">
          <Tag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-[var(--color-primary-500)]" />
          <p className="text-xs sm:text-sm text-[var(--color-primary-900)] mb-1 sm:mb-2">No tags yet</p>
          <p className="text-xs text-[var(--color-primary-700)]">Generate tags from your content to help categorize your listing</p>
        </div>
      )}

    </div>
  );
}

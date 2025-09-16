"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
  maxTags?: number;
}

export function TagEditor({
  tags,
  onTagsChange,
  availableTags = [],
  maxTags = 10,
}: TagEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = availableTags
    .filter(
      (tag) =>
        tag.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(tag)
    )
    .slice(0, 5);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(newTag);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setNewTag("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Tag className="h-3 w-3 text-muted-foreground" />
        <div className="flex flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-foreground"
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No tags</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <Tag className="h-3 w-3 text-muted-foreground" />
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-foreground"
              >
                <X className="h-2 w-2" />
              </button>
            </span>
          ))}
        </div>
        <Input
          ref={inputRef}
          value={newTag}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setTimeout(() => {
              setIsEditing(false);
              setNewTag("");
              setShowSuggestions(false);
            }, 200);
          }}
          placeholder="Add tag..."
          className="h-6 text-xs min-w-[80px]"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsEditing(false);
            setNewTag("");
            setShowSuggestions(false);
          }}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[120px]">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleAddTag(suggestion)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted first:rounded-t-md last:rounded-b-md"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


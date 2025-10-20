import React, { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    onSend(text);
    setInputText("");
  };

  return (
    <div className="p-4 border-t border-border bg-muted flex items-center gap-2 lg:gap-3 flex-shrink-0">
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        type="text"
        placeholder={placeholder}
        className="flex-1"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <Button
        onClick={handleSend}
        disabled={!inputText.trim()}
        size="icon"
        className="bg-secondary-500 hover:bg-secondary-600"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}

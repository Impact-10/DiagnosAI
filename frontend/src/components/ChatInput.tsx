import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSendMessage, disabled, placeholder = "Type your health question..." }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-background">
      <div className="flex-1 relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10 bg-input-background border border-border rounded-full py-3 px-4 text-[0.875rem] font-normal focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      </div>
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        <Send className="w-4 h-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  isBot: boolean;
  timestamp: string;
  isTyping?: boolean;
}

export function ChatBubble({ message, isBot, timestamp, isTyping }: ChatBubbleProps) {
  return (
    <div className={`flex gap-3 mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <Avatar className="w-8 h-8 bg-primary flex-shrink-0">
          <AvatarImage src="/bot-avatar.png" alt="Medical Assistant" />
          <AvatarFallback>
            <Bot className="w-4 h-4 text-primary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isBot ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isBot
              ? 'bg-card text-card-foreground rounded-tl-sm'
              : 'bg-primary text-primary-foreground rounded-tr-sm'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            </div>
          ) : (
            <p className="text-[0.875rem] font-normal leading-[1.5]">{message}</p>
          )}
        </div>
        <span className="text-[0.75rem] font-normal text-muted-foreground mt-1 px-1">{timestamp}</span>
      </div>
      
      {!isBot && (
        <Avatar className="w-8 h-8 bg-secondary flex-shrink-0">
          <AvatarFallback>
            <User className="w-4 h-4 text-secondary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
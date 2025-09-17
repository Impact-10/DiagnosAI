import { Button } from "./ui/button";

interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
}

export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(option)}
          className="rounded-full text-[0.75rem] font-normal bg-background hover:bg-accent/50 border-border text-foreground"
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
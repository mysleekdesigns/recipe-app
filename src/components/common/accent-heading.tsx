import { cn } from "@/lib/utils";

interface AccentHeadingProps {
  text: string;
  accentWord: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export function AccentHeading({
  text,
  accentWord,
  as: Component = "h2",
  className,
}: AccentHeadingProps) {
  // Split the text to find and highlight the accent word
  const parts = text.split(new RegExp(`(${accentWord})`, "gi"));

  return (
    <Component className={cn("font-bold", className)}>
      {parts.map((part, index) => {
        const isAccent = part.toLowerCase() === accentWord.toLowerCase();
        return isAccent ? (
          <span key={index} className="text-primary">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </Component>
  );
}

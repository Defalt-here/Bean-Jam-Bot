interface ChatMessageProps {
  content: string;
  isUser: boolean;
  language: 'en' | 'jp';
}

export const ChatMessage = ({ content, isUser, language }: ChatMessageProps) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-3 border-2 border-foreground font-mono text-sm ${
          isUser ? 'bg-foreground text-background' : 'bg-background text-foreground'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

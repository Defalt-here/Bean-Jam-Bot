interface ChatMessageProps {
  content: string;
  isUser: boolean;
  language: 'en' | 'jp';
}

/**
 * Format Gemini response text into structured HTML
 * Handles bullet points, numbered lists, headers, and paragraphs
 */
const formatMessageContent = (text: string): JSX.Element => {
  // Split by double newlines for paragraphs
  const sections = text.split('\n\n');
  
  return (
    <div className="space-y-3">
      {sections.map((section, sectionIndex) => {
        const lines = section.split('\n').filter(line => line.trim());
        
        // Check if this section is a list
        const isBulletList = lines.every(line => 
          line.trim().startsWith('•') || 
          line.trim().startsWith('-') || 
          line.trim().startsWith('*')
        );
        
        const isNumberedList = lines.every(line => 
          /^\d+[.)]\s/.test(line.trim())
        );
        
        // Render bullet list
        if (isBulletList && lines.length > 0) {
          return (
            <ul key={sectionIndex} className="list-disc list-inside space-y-1.5 ml-2">
              {lines.map((line, lineIndex) => {
                const cleanLine = line.trim().replace(/^[•\-*]\s*/, '');
                return (
                  <li key={lineIndex} className="leading-relaxed">
                    {cleanLine}
                  </li>
                );
              })}
            </ul>
          );
        }
        
        // Render numbered list
        if (isNumberedList && lines.length > 0) {
          return (
            <ol key={sectionIndex} className="list-decimal list-inside space-y-1.5 ml-2">
              {lines.map((line, lineIndex) => {
                const cleanLine = line.trim().replace(/^\d+[.)]\s*/, '');
                return (
                  <li key={lineIndex} className="leading-relaxed">
                    {cleanLine}
                  </li>
                );
              })}
            </ol>
          );
        }
        
        // Check if single line is a header (ends with : or all caps)
        if (lines.length === 1) {
          const line = lines[0].trim();
          if (line.endsWith(':') || (line === line.toUpperCase() && line.length > 3 && line.length < 50)) {
            return (
              <h3 key={sectionIndex} className="font-bold text-base mt-2 mb-1">
                {line}
              </h3>
            );
          }
        }
        
        // Regular paragraph(s)
        return (
          <div key={sectionIndex} className="space-y-2">
            {lines.map((line, lineIndex) => (
              <p key={lineIndex} className="leading-relaxed">
                {line.trim()}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const ChatMessage = ({ content, isUser, language }: ChatMessageProps) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-[70%] px-4 py-3 border-2 border-foreground font-mono text-sm ${
          isUser ? 'bg-foreground text-background' : 'bg-background text-foreground'
        }`}
      >
        {isUser ? (
          <div>{content}</div>
        ) : (
          formatMessageContent(content)
        )}
      </div>
    </div>
  );
};

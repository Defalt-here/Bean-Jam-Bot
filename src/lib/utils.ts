import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Strip common Markdown syntax and fence markers so output renders as plain text.
// - Removes backticks, code fences, bold/italic asterisks/underscores, headings, links, images.
// - Collapses multiple spaces/newlines cleanly.
export function sanitizeMarkdown(input: string): string {
  if (!input) return '';
  let out = input;
  // Remove code fences ```lang ... ```
  out = out.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
  // Remove inline code backticks `code`
  out = out.replace(/`([^`]+)`/g, '$1');
  // Remove bold/italic markers **text**, *text*, __text__, _text_
  out = out.replace(/\*\*(.*?)\*\*/g, '$1');
  out = out.replace(/\*(.*?)\*/g, '$1');
  out = out.replace(/__(.*?)__/g, '$1');
  out = out.replace(/_(.*?)_/g, '$1');
  // Remove markdown headings #, ##, etc. but keep text
  out = out.replace(/^\s{0,3}#+\s+/gm, '');
  // Replace markdown links [text](url) -> text (url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  // Remove images ![alt](src) -> alt (src)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 ($2)');
  // Horizontal rules --- or ***
  out = out.replace(/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/gm, '');
  // Collapse excessive spaces and trim
  out = out.replace(/\s{3,}/g, ' ');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

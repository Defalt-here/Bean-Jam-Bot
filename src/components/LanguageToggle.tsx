interface LanguageToggleProps {
  language: 'en' | 'jp';
  onToggle: () => void;
}

export const LanguageToggle = ({ language, onToggle }: LanguageToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="px-4 py-2 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors duration-200 font-mono font-bold text-sm"
    >
      {language === 'en' ? 'EN' : 'JP'}
    </button>
  );
};

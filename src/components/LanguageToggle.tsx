import { useLanguage } from '@/contexts/useLanguage';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="relative inline-flex border-2 border-foreground bg-background font-mono text-sm">
      {/* EN Button */}
      <button
        onClick={() => language === 'jp' && toggleLanguage()}
        className={`px-4 py-2 font-bold transition-all duration-200 ${
          language === 'en'
            ? 'bg-foreground text-background'
            : 'bg-background text-foreground hover:bg-foreground/10'
        }`}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      
      {/* JP Button */}
      <button
        onClick={() => language === 'en' && toggleLanguage()}
        className={`px-4 py-2 font-bold transition-all duration-200 border-l-2 border-foreground ${
          language === 'jp'
            ? 'bg-foreground text-background'
            : 'bg-background text-foreground hover:bg-foreground/10'
        }`}
        aria-label="日本語に切り替え"
        aria-pressed={language === 'jp'}
      >
        JP
      </button>
    </div>
  );
};

import { useLanguage } from '@/contexts/useLanguage';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors duration-200 font-mono font-bold text-sm"
      aria-label={language === 'en' ? 'Switch to Japanese' : '英語に切り替え'}
    >
      {language === 'en' ? 'EN' : 'JP'}
    </button>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const currentLang = i18n.resolvedLanguage || i18n.language;
  const isHindi = currentLang.startsWith('hi');

  const toggleLanguage = () => {
    const newLang = isHindi ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-md border border-slate-600 transition-colors cursor-pointer"
      title="Toggle Language (English / हिन्दी)"
    >
      <Languages className="w-3.5 h-3.5 text-blue-400" />
      <span>{isHindi ? 'English' : 'हिन्दी'}</span>
    </button>
  );
}

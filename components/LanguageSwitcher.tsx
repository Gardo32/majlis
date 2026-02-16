"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="win-button px-2 py-1 flex items-center gap-1"
            title={locale === 'ar' ? "Switch to English" : "التبديل للعربية"}
        >
            <span className="text-sm">🌐</span>
            <span className="text-xs font-bold">
                {locale === 'ar' ? 'EN' : 'عربي'}
            </span>
        </button>
    );
}

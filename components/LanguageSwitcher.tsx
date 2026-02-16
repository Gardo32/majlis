"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            title={locale === 'ar' ? "Switch to English" : "التبديل للعربية"}
        >
            <span className="text-xl">🌐</span>
            <span className="text-sm font-bold w-6">
                {locale === 'ar' ? 'EN' : 'عربي'}
            </span>
        </button>
    );
}

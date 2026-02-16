"use client";

import { useLanguage } from "./LanguageProvider";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="win-status-bar mt-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 text-xs sm:text-sm">
        <span>{t('footer.rights')} {new Date().getFullYear()}</span>
        <span>{t('footer.ramadan')}</span>
      </div>
    </footer>
  );
}

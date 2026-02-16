"use client";

import { useLanguage } from "./LanguageProvider";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="win-status-bar mt-4">
      <div className="container mx-auto flex justify-between items-center">
        <span>{t('footer.rights')} {new Date().getFullYear()}</span>
        <span>{t('footer.ramadan')}</span>
      </div>
    </footer>
  );
}

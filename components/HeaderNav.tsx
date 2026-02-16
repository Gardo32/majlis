"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

interface HeaderNavProps {
  user: {
    name: string;
    role: string;
  } | null;
}

export function HeaderNav({ user }: HeaderNavProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Title Bar */}
      <div className="win-title-bar-flat text-center py-2 flex justify-between items-center px-4">
        <div className="w-20"></div>
        <h1 className="text-sm sm:text-lg">{t('app.title')}</h1>
        <div className="w-20 flex justify-end">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-secondary border-b-2 border-border p-2">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <Link href="/" className="win-button text-xs sm:text-sm">
              🏠 {t('nav.home')}
            </Link>
            <Link href="/calendar" className="win-button text-xs sm:text-sm">
              📅 {t('nav.calendar')}
            </Link>
            <Link href="/progress" className="win-button text-xs sm:text-sm">
              📊 {t('nav.progress')}
            </Link>
            <Link href="/radio" className="win-button text-xs sm:text-sm">
              📻 {t('nav.radio')}
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-xs sm:text-sm border-2 border-border bg-card px-2 py-1 hidden sm:inline">
                  {user.name} ({user.role})
                </span>
                {(user.role === "ADMIN" ||
                  user.role === "MAJLIS_CONTROLLER" ||
                  user.role === "MAJLIS") && (
                    <Link href="/dashboard" className="win-button text-xs sm:text-sm">
                      ⚙️ {t('nav.dashboard')}
                    </Link>
                  )}
                <Link href="/logout" className="win-button text-xs sm:text-sm">
                  🚪 {t('nav.logout')}
                </Link>
              </>
            ) : (
              <Link href="/login" className="win-button text-xs sm:text-sm">
                🔐 {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

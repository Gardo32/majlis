"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Title Bar */}
      <div className="win-title-bar-flat text-center py-2 flex justify-between items-center px-2 sm:px-4">
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
        </div>
        <h1 className="text-xs sm:text-lg font-bold truncate mx-2">{t('app.title')}</h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="win-button p-1 text-sm md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-secondary border-b-2 border-border p-2">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <Link href="/" className="win-button text-sm">
              🏠 {t('nav.home')}
            </Link>
            <Link href="/calendar" className="win-button text-sm">
              📅 {t('nav.calendar')}
            </Link>
            <Link href="/radio" className="win-button text-sm">
              📻 {t('nav.radio')}
            </Link>
            <Link href="/album" className="win-button text-sm">
              📸 {t('nav.album')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm border-2 border-border bg-card px-2 py-1">
                  {user.name} ({user.role})
                </span>
                {(user.role === "ADMIN" ||
                  user.role === "MAJLIS") && (
                    <Link href="/dashboard" className="win-button text-sm">
                      ⚙️ {t('nav.dashboard')}
                    </Link>
                  )}
                <Link href="/logout" className="win-button text-sm">
                  🚪 {t('nav.logout')}
                </Link>
              </>
            ) : (
              <Link href="/login" className="win-button text-sm">
                🔐 {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - dropdown */}
      {menuOpen && (
        <nav className="md:hidden bg-secondary border-b-2 border-border">
          <div className="flex flex-col p-2 gap-1">
            <Link href="/" className="win-button text-sm py-2 text-center" onClick={() => setMenuOpen(false)}>
              🏠 {t('nav.home')}
            </Link>
            <Link href="/calendar" className="win-button text-sm py-2 text-center" onClick={() => setMenuOpen(false)}>
              📅 {t('nav.calendar')}
            </Link>
            <Link href="/radio" className="win-button text-sm py-2 text-center" onClick={() => setMenuOpen(false)}>
              📻 {t('nav.radio')}
            </Link>
            <Link href="/album" className="win-button text-sm py-2 text-center" onClick={() => setMenuOpen(false)}>
              📸 {t('nav.album')}
            </Link>
            {user ? (
              <>
                <div className="text-xs text-center py-1 text-muted-foreground">
                  {user.name} ({user.role})
                </div>
                {(user.role === "ADMIN" ||
                  user.role === "MAJLIS") && (
                    <Link href="/dashboard" className="win-button text-sm py-2 text-center" onClick={() => setMenuOpen(false)}>
                      ⚙️ {t('nav.dashboard')}
                    </Link>
                  )}
                <Link href="/logout" className="win-button text-sm py-2 text-center" onClick={() => setMenuOpen(false)}>
                  🚪 {t('nav.logout')}
                </Link>
              </>
            ) : (
              <Link href="/login" className="win-button text-sm py-2 text-center" onClick={() => setMenuOpen(false)}>
                🔐 {t('nav.login')}
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}

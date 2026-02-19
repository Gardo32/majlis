"use client";

import { WindowBox } from "@/components/WindowBox";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

interface DashboardProps {
  user: {
    name: string;
    role: string;
  };
}

export function DashboardPageContent({ user }: DashboardProps) {
  const { t } = useLanguage();
  const { role } = user;
  const isMajlisOrAdmin = role === "ADMIN" || role === "MAJLIS";

  return (
    <div className="space-y-4">
      <WindowBox title={t('dashboard.title')}>
        <div className="space-y-2">
          <p>
            {t('dashboard.welcome')} <strong>{user.name}</strong>
          </p>
          <p>
            {t('dashboard.role')}:{" "}
            <span className="bg-secondary px-2 py-1 border border-border">
              {role}
            </span>
          </p>
        </div>
      </WindowBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schedule / Calendar Management - MAJLIS + ADMIN */}
        {isMajlisOrAdmin && (
          <WindowBox title={t('dashboard.calendar_mgmt')}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.calendar_desc')}
              </p>
              <Link href="/dashboard/controller" className="win-button block text-center">
                {t('dashboard.open_controller')}
              </Link>
            </div>
          </WindowBox>
        )}

        {/* Radio / Live - MAJLIS + ADMIN */}
        {isMajlisOrAdmin && (
          <WindowBox title={t('dashboard.radio_mgmt')}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.radio_desc')}
              </p>
              <Link href="/dashboard/majlis" className="win-button block text-center">
                {t('dashboard.open_radio')}
              </Link>
            </div>
          </WindowBox>
        )}

        {/* Album Management - MAJLIS + ADMIN */}
        {isMajlisOrAdmin && (
          <WindowBox title={t('dashboard.album_mgmt')}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.album_desc')}
              </p>
              <Link href="/dashboard/album" className="win-button block text-center">
                {t('dashboard.open_album')}
              </Link>
            </div>
          </WindowBox>
        )}

        {/* User Management - ADMIN only */}
        {role === "ADMIN" && (
          <WindowBox title={t('dashboard.user_mgmt')}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.user_desc')}
              </p>
              <Link href="/dashboard/admin" className="win-button block text-center">
                {t('dashboard.open_admin')}
              </Link>
            </div>
          </WindowBox>
        )}
      </div>

      {/* Quick Links */}
      <WindowBox title={t('dashboard.quick_links')}>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="win-button">
             {t('nav.home')}
          </Link>
          <Link href="/calendar" className="win-button">
             {t('nav.calendar')}
          </Link>
          <Link href="/radio" className="win-button">
             {t('nav.radio')}
          </Link>
          <Link href="/album" className="win-button">
             {t('nav.album')}
          </Link>
        </div>
      </WindowBox>
    </div>
  );
}
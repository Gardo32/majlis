"use client";

import { useEffect } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { WindowBox } from "@/components/WindowBox";
import { useLanguage } from "@/components/LanguageProvider";

export default function LogoutPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut();
      router.push("/");
      router.refresh();
    };
    handleLogout();
  }, [router]);

  return (
    <div className="max-w-md mx-auto mt-8">
      <WindowBox title={t('auth.logging_out')}>
        <div className="text-center py-8">
          <p>{t('auth.logging_out_msg')}</p>
        </div>
      </WindowBox>
    </div>
  );
}

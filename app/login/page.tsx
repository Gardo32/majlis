"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { WindowBox } from "@/components/WindowBox";
import { useLanguage } from "@/components/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || t('auth.error'));
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <WindowBox title={t('auth.login_title')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border-2 border-red-600 bg-red-100 dark:bg-red-900/50 p-3 text-red-800 dark:text-red-200">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block font-bold mb-1">{t('auth.email')}:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="win-input w-full"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1">{t('auth.password')}:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="win-input w-full"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="win-button w-full"
          >
            {loading ? t('auth.logging_in') : t('auth.login_btn')}
          </button>
        </form>
      </WindowBox>

      <WindowBox title={t('auth.info_title')} className="mt-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>{t('auth.info_desc')}</p>
          <p>{t('auth.info_visitors')}</p>
        </div>
      </WindowBox>
    </div>
  );
}

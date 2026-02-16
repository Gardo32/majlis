"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="win-button px-2 py-1 text-xs font-bold"
            title={theme === "dark" ? t('theme.light') : t('theme.dark')}
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}

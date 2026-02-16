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
            className="panel-button text-xs font-bold flex items-center gap-1"
            title="Toggle Theme"
        >
            {theme === "dark" ? t('theme.light') : t('theme.dark')}
        </button>
    );
}

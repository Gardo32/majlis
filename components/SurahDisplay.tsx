interface SurahDisplayProps {
  arabic: string;
  english: string;
  size?: "sm" | "md" | "lg";
}

export function SurahDisplay({ arabic, english, size = "md" }: SurahDisplayProps) {
  const sizeClasses = {
    sm: {
      arabic: "text-lg",
      english: "text-sm",
    },
    md: {
      arabic: "text-2xl",
      english: "text-lg",
    },
    lg: {
      arabic: "text-4xl",
      english: "text-2xl",
    },
  };

  return (
    <div className="space-y-1">
      <div className={`font-quran-arabic rtl ${sizeClasses[size].arabic}`}>
        {arabic}
      </div>
      <div className={`font-surah-english ${sizeClasses[size].english}`}>
        {english}
      </div>
    </div>
  );
}

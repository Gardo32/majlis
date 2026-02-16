interface ProgressBarProps {
  percentage: number;
  label?: string;
}

export function ProgressBar({ percentage, label }: ProgressBarProps) {
  const filledBlocks = Math.floor(percentage / 5);
  const emptyBlocks = 20 - filledBlocks;

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-bold">{label}</div>
      )}
      <div className="win-progress-container">
        <div 
          className="win-progress-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="font-mono text-sm">
        [{"■".repeat(filledBlocks)}{"□".repeat(emptyBlocks)}] {percentage.toFixed(1)}%
      </div>
    </div>
  );
}

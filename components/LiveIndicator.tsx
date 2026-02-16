interface LiveIndicatorProps {
  isLive: boolean;
}

export function LiveIndicator({ isLive }: LiveIndicatorProps) {
  return (
    <div className="live-indicator">
      <div className={`live-dot ${isLive ? "active" : ""}`} />
      <span className="text-sm font-bold">
        {isLive ? "LIVE" : "OFFLINE"}
      </span>
    </div>
  );
}

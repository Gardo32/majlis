interface WindowBoxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function WindowBox({ title, children, className = "", id }: WindowBoxProps) {
  return (
    <div className={`win-box ${className}`} id={id}>
      <div className="win-title-bar-flat text-sm sm:text-base">{title}</div>
      <div className="p-3 sm:p-4 bg-card text-card-foreground">{children}</div>
    </div>
  );
}

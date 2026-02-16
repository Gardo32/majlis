interface WindowBoxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function WindowBox({ title, children, className = "", id }: WindowBoxProps) {
  return (
    <div className={`win-box ${className}`} id={id}>
      <div className="win-title-bar-flat">{title}</div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  );
}

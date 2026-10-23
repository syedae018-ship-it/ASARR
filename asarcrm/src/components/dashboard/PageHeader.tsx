interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, subtitle, action, children }: PageHeaderProps) {
  const desc = description || subtitle;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">{title}</h1>
        {desc && (
          <p className="text-muted-foreground mt-1 text-sm">{desc}</p>
        )}
      </div>
      {(action || children) && (
        <div className="flex flex-wrap items-center gap-2">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}

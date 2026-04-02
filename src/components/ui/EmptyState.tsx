import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  action?: ReactNode;
  description: ReactNode;
  icon: ReactNode;
  title: ReactNode;
  className?: string;
}

export function EmptyState({ action, className, description, icon, title }: EmptyStateProps) {
  return (
    <div className={cn('text-center space-y-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 py-20', className)}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">{icon}</div>
      <div className="space-y-1">
        <p className="font-medium text-zinc-400">{title}</p>
        <p className="text-xs text-zinc-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

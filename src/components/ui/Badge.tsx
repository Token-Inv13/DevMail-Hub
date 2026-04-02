import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'info';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const variantClassNames: Record<BadgeVariant, string> = {
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  danger: 'bg-red-500/10 text-red-500',
  neutral: 'bg-zinc-800 text-zinc-500',
  accent: 'bg-orange-500/10 text-orange-500',
  info: 'bg-blue-500/10 text-blue-500',
};

export function Badge({ children, className, variant = 'neutral' }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase', variantClassNames[variant], className)}>
      {children}
    </span>
  );
}

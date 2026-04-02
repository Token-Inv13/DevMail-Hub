import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-zinc-800 bg-zinc-900/50', className)} {...props}>
      {children}
    </div>
  );
}

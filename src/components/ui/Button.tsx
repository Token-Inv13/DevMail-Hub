import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20',
  secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
  ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800',
  accent: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 rounded-lg text-[10px] font-bold',
  md: 'px-4 py-2.5 rounded-xl text-sm font-semibold',
  lg: 'px-6 py-3 rounded-xl text-sm font-bold',
};

export function Button({
  children,
  className,
  disabled,
  size = 'md',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50',
        variantClassNames[variant],
        sizeClassNames[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

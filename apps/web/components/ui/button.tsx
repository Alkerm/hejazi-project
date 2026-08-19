import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'dark' | 'none';
};

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-amber-500 text-slate-950 font-black hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 active:bg-amber-700',
  dark: 'bg-slate-950 text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-400 hover:text-slate-950 active:bg-amber-500 hover:shadow-lg',
  secondary: 'border border-slate-200/90 bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-amber-50/40 hover:border-amber-200 active:bg-slate-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 hover:shadow-lg hover:shadow-red-500/10',
  none: '',
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      suppressHydrationWarning
      className={`rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

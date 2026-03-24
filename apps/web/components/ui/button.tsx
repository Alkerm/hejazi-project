import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

import { PropsWithChildren } from 'react';

type BadgeVariant = 'default' | 'warning' | 'success' | 'danger';

const styles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
};

export function Badge({ children, variant = 'default' }: PropsWithChildren<{ variant?: BadgeVariant }>) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[variant]}`}>{children}</span>;
}

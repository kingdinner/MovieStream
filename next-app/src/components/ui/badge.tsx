import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/15 text-neutral-200 border border-white/20',
        brand: 'bg-brand/15 text-[#ff7070] border border-brand/35',
        match: 'bg-transparent text-match font-bold text-sm px-0',
        hd: 'bg-white/13 text-neutral-300 border border-white/20 uppercase tracking-wider text-[11px]',
        watched: 'bg-[#46d369]/90 text-white font-bold text-[10px] tracking-wide uppercase',
        outline: 'border border-white/20 text-neutral-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

import { Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xl font-bold text-primary", className)}>
      <Clapperboard className="h-7 w-7" />
      <span className="text-white">StreamVerse</span>
    </div>
  );
}

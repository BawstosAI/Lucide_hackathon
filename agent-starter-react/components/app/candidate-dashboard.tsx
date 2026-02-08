'use client';

import { CandidateCard } from '@/components/app/candidate-card';
import { candidates } from '@/lib/candidates';
import { cn } from '@/lib/shadcn/utils';

interface CandidateDashboardProps {
  activeCandidateId: string | null;
  compact?: boolean;
  className?: string;
}

export function CandidateDashboard({
  activeCandidateId,
  compact = false,
  className,
}: CandidateDashboardProps) {
  return (
    <div
      className={cn(
        'grid gap-2',
        compact ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          isActive={activeCandidateId === candidate.id}
          compact={compact}
        />
      ))}
    </div>
  );
}

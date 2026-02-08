'use client';

import { motion } from 'motion/react';
import type { Candidate } from '@/lib/candidates';
import { cn } from '@/lib/shadcn/utils';

interface CandidateCardProps {
  candidate: Candidate;
  isActive: boolean;
  compact?: boolean;
}

export function CandidateCard({ candidate, isActive, compact = false }: CandidateCardProps) {
  return (
    <motion.div
      layout
      animate={isActive ? { scale: 1.03 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'bg-card text-card-foreground relative flex items-center gap-3 overflow-hidden rounded-lg border transition-shadow duration-300',
        compact ? 'p-2' : 'p-3',
        isActive && 'candidate-glow'
      )}
      style={
        isActive
          ? {
              borderColor: candidate.color,
              boxShadow: `0 0 16px ${candidate.color}40, 0 0 4px ${candidate.color}20`,
            }
          : undefined
      }
    >
      {/* Party-colored left bar */}
      <div
        className="absolute top-0 left-0 h-full w-1 rounded-l-lg"
        style={{ backgroundColor: candidate.color }}
      />

      {/* Circular avatar with photo */}
      <img
        src={candidate.photo}
        alt={candidate.name}
        className={cn('shrink-0 rounded-full object-cover', compact ? 'size-8' : 'size-10')}
      />

      {/* Name & party */}
      <div className="ml-1 min-w-0 flex-1">
        <p className={cn('truncate font-serif font-semibold', compact ? 'text-xs' : 'text-sm')}>
          {candidate.name}
        </p>
        <p className={cn('text-muted-foreground truncate', compact ? 'text-[10px]' : 'text-xs')}>
          {candidate.partyShort} — {candidate.party}
        </p>
      </div>

      {/* Active indicator pulse */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mr-1 size-2 shrink-0 rounded-full"
          style={{ backgroundColor: candidate.color }}
        >
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="size-full rounded-full"
            style={{ backgroundColor: candidate.color }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

import Image from 'next/image';
import { BookOpen, Swords } from 'lucide-react';
import type { AppMode } from '@/hooks/useAppMode';
import { candidates } from '@/lib/candidates';

interface WelcomeViewProps {
  onStartCall: (mode: AppMode) => void;
}

export const WelcomeView = ({
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref}>
      <section className="bg-background flex min-h-svh flex-col items-center justify-center px-4 text-center">
        {/* Tricolore decorative stripe */}
        <div className="tricolore-stripe mb-8 h-1 w-24 rounded-full" />

        {/* Serif title */}
        <h1 className="text-foreground font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Municipales Paris
        </h1>
        <span className="text-primary mt-1 font-serif text-5xl font-bold md:text-6xl">2026</span>

        {/* Subtitle */}
        <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed md:text-base">
          Posez vos questions sur les candidats, leurs programmes et les enjeux des élections
          municipales de Paris.
        </p>

        {/* Candidate avatar circles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="flex flex-col items-center gap-1.5">
              <div
                className="size-14 overflow-hidden rounded-full shadow-sm ring-2 ring-offset-2"
                style={{ '--tw-ring-color': candidate.color } as React.CSSProperties}
                title={candidate.name}
              >
                <Image
                  src={candidate.photo}
                  alt={candidate.name}
                  width={56}
                  height={56}
                  className="size-full object-cover"
                />
              </div>
              <span className="text-muted-foreground max-w-[72px] truncate text-[10px]">
                {candidate.lastName}
              </span>
            </div>
          ))}
        </div>

        {/* Mode buttons */}
        <div className="mt-8 flex w-full max-w-lg flex-col items-stretch gap-4 sm:flex-row sm:gap-6">
          <button
            onClick={() => onStartCall('inform')}
            className="bg-card hover:border-primary/50 border-border group flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
          >
            <BookOpen className="text-primary size-8" />
            <span className="text-foreground font-serif text-lg font-semibold">
              S&apos;informer
            </span>
            <span className="text-muted-foreground text-xs leading-relaxed">
              Posez vos questions sur les candidats et leurs programmes
            </span>
          </button>

          <button
            onClick={() => onStartCall('debate')}
            className="bg-card hover:border-primary/50 border-border group flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
          >
            <Swords className="text-primary size-8" />
            <span className="text-foreground font-serif text-lg font-semibold">Débattre</span>
            <span className="text-muted-foreground text-xs leading-relaxed">
              Confrontez vos idées avec un candidat de votre choix
            </span>
          </button>
        </div>
      </section>

      {/* Footer disclaimer */}
      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
        <p className="text-muted-foreground max-w-prose px-4 pt-1 text-center text-xs leading-5 font-normal text-pretty">
          Informations issues de sources publiques. Cet assistant ne représente aucun candidat ni
          parti politique.
        </p>
      </div>
    </div>
  );
};

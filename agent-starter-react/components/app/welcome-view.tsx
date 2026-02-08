import { Button } from '@/components/ui/button';
import { candidates } from '@/lib/candidates';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
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
            <div key={candidate.id} className="flex flex-col items-center gap-1">
              <div
                className="flex size-11 items-center justify-center rounded-full font-serif text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: candidate.color }}
                title={candidate.name}
              >
                {candidate.initials}
              </div>
              <span className="text-muted-foreground max-w-[60px] truncate text-[10px]">
                {candidate.lastName}
              </span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-8 w-72 rounded-full font-mono text-xs font-bold tracking-wider uppercase"
        >
          {startButtonText}
        </Button>
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

import { ArrowLeft, Home, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';

interface ScreenShellProps {
  title?: string;
  children: ReactNode;
  onBack?: () => void;
  onHome?: () => void;
  onReset?: () => void;
}

export const ScreenShell = ({ title, children, onBack, onHome, onReset }: ScreenShellProps) => (
  <main className="min-h-dvh bg-pearl text-graphite">
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-chalk">
      <header className="sticky top-0 z-30 border-b border-mist/60 bg-chalk/95 px-4 pb-3 pt-3 backdrop-blur-xl [@media(max-height:700px)]:pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-mist/80 bg-chalk text-graphite transition hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                onClick={onBack}
                aria-label="Retour"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            {onHome ? (
              <button type="button" className="text-left text-[1.05rem] font-bold tracking-tight" onClick={onHome}>
                Style<span className="text-terracotta">*</span>Memory
              </button>
            ) : (
              <p className="text-left text-[1.05rem] font-bold tracking-tight">
                Style<span className="text-terracotta">*</span>Memory
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-mist/80 bg-chalk text-stone transition hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                onClick={onReset}
                aria-label="Reinitialiser la demo"
              >
                <RotateCcw size={17} />
              </button>
            )}
            {onHome && (
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full bg-graphite text-chalk shadow-fine transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                onClick={onHome}
                aria-label="Menu"
              >
                <Home size={17} />
              </button>
            )}
          </div>
        </div>
        {title && <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[0.95] text-graphite [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:text-[1.78rem] sm:text-[2.35rem]">{title}</h1>}
      </header>
      <div className="flex-1 px-4 pb-6 pt-4 [@media(max-height:700px)]:pb-4 [@media(max-height:700px)]:pt-3">{children}</div>
    </div>
  </main>
);

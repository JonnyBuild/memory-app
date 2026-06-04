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
      <header className="sticky top-0 z-30 border-b border-mist/70 bg-chalk/92 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-mist text-graphite"
                onClick={onBack}
                aria-label="Retour"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <button type="button" className="text-left text-xl font-black tracking-normal" onClick={onHome}>
              Style<span className="text-terracotta">*</span>Memory
            </button>
          </div>
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-mist text-stone"
                onClick={onReset}
                aria-label="Reinitialiser la demo"
              >
                <RotateCcw size={17} />
              </button>
            )}
            {onHome && (
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full bg-graphite text-chalk"
                onClick={onHome}
                aria-label="Menu"
              >
                <Home size={17} />
              </button>
            )}
          </div>
        </div>
        {title && <h1 className="mt-4 text-2xl font-black leading-tight text-graphite">{title}</h1>}
      </header>
      <div className="flex-1 px-4 pb-8 pt-5">{children}</div>
    </div>
  </main>
);

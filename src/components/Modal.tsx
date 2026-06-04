import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const Modal = ({ title, children, onClose }: ModalProps) => (
  <div className="fixed inset-0 z-50 flex items-end bg-ink/45 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
    <section className="w-full rounded-2xl border border-mist/80 bg-chalk p-5 shadow-soft sm:max-w-md" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold leading-none text-graphite">{title}</h2>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-mist/80 text-graphite transition hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </section>
  </div>
);

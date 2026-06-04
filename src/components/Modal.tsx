import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const Modal = ({ title, children, onClose }: ModalProps) => (
  <div className="fixed inset-0 z-50 flex items-end bg-ink/45 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
    <section className="w-full rounded-[1.75rem] bg-chalk p-5 shadow-soft sm:max-w-md" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-graphite">{title}</h2>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-mist text-graphite"
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

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Style Memory App', () => {
  it('ouvre le menu puis la grille des silhouettes', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /commencer/i }));
    await user.click(screen.getByRole('button', { name: /mes silhouettes/i }));

    expect(screen.getByRole('heading', { name: /mes silhouettes/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/lieu, personne, piece/i)).toBeInTheDocument();
    expect(screen.getByText(/jean brut \+ pull gris/i)).toBeInTheDocument();
  });

  it('affiche seulement les silhouettes avec photo memoire dans le calendrier', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /commencer/i }));
    await user.click(screen.getByRole('button', { name: /mon calendrier/i }));

    const calendar = screen.getByRole('main');
    expect(within(calendar).getByText('3')).toBeInTheDocument();
    expect(screen.queryByText(/lyon octobre/i)).not.toBeInTheDocument();
  });
});

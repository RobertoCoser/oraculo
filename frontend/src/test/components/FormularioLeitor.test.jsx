import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormularioLeitor from '../../components/FormularioLeitor';

vi.mock('axios');

describe('FormularioLeitor Component', () => {
  const mockOnLeitorSalvo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {

    it('deve renderizar o botão de cadastrar', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);
      expect(screen.getByRole('button', { name: /Cadastrar Leitor/i })).toBeInTheDocument();
    });
  });
});
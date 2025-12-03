import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormularioLivro from '../../components/FormularioLivro';

// Mock do axios
vi.mock('axios');

describe('FormularioLivro Component', () => {
  const mockOnLivroCadastrado = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {

    it('deve renderizar o botão de cadastrar', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);
      expect(screen.getByRole('button', { name: /Cadastrar Livro/i })).toBeInTheDocument();
    });
  });
});
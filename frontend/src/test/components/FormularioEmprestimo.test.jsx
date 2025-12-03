import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import FormularioEmprestimo from '../../components/FormularioEmprestimo';

// Mock do axios
vi.mock('axios');

// Mock do window.alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('FormularioEmprestimo Component', () => {
  const mockOnEmprestimoRealizado = vi.fn();

  const livrosMock = [
    { _id: '1', titulo: 'Clean Code', autor: 'Robert C. Martin', disponivel: true },
    { _id: '2', titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', disponivel: true }
  ];

  const leitoresMock = [
    { _id: 'a1', nome: 'João Silva', contato: 'joao@email.com' },
    { _id: 'a2', nome: 'Maria Santos', contato: '(11) 99999-9999' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o título e selects', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('Registrar Empréstimo')).toBeInTheDocument();
      expect(screen.getByText('📖 Selecione o Livro')).toBeInTheDocument();
      expect(screen.getByText('👤 Selecione o Leitor')).toBeInTheDocument();
    });

    it('deve exibir apenas livros disponíveis', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('Clean Code - Robert C. Martin')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('deve exibir alerta quando não há livros disponíveis', () => {
      render(
        <FormularioEmprestimo
          livros={[]}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText(/Não há livros disponíveis/i)).toBeInTheDocument();
    });
  });

  describe('Envio do Formulário', () => {
    it('deve registrar empréstimo com sucesso', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: 'emp123' } });

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[0], '1');
      await user.selectOptions(selects[1], 'a1');
      await user.click(screen.getByRole('button', { name: /Realizar Empréstimo/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/emprestimos',
          { idLivro: '1', idLeitor: 'a1' }
        );
        expect(mockAlert).toHaveBeenCalledWith('✅ Empréstimo registrado!');
        expect(mockOnEmprestimoRealizado).toHaveBeenCalled();
      });
    });

    it('deve exibir erro ao falhar no empréstimo', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue(new Error('Erro'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[0], '1');
      await user.selectOptions(selects[1], 'a1');
      await user.click(screen.getByRole('button', { name: /Realizar Empréstimo/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('❌ Erro ao realizar empréstimo.');
      });
    });
  });
});
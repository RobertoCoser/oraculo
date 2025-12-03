import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ListaEmprestimos from '../../components/ListaEmprestimos';

// Mock do axios
vi.mock('axios');

// Mock do window.confirm e window.alert
const mockConfirm = vi.spyOn(window, 'confirm');
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('ListaEmprestimos Component', () => {
  const mockOnDevolucao = vi.fn();

  const emprestimosMock = [
    {
      _id: '1',
      nomeLivro: 'Clean Code',
      nomeLeitor: 'João Silva',
      dataEmprestimo: '2025-11-01T10:00:00.000Z'
    },
    {
      _id: '2',
      nomeLivro: 'O Senhor dos Anéis',
      nomeLeitor: 'Maria Santos',
      dataEmprestimo: '2025-11-15T14:30:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o título', async () => {
      axios.get.mockResolvedValue({ data: [] });
      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);
      expect(screen.getByText('Empréstimos Ativos')).toBeInTheDocument();
    });

    it('deve exibir empty state quando não há empréstimos', async () => {
      axios.get.mockResolvedValue({ data: [] });
      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);
      
      await waitFor(() => {
        expect(screen.getByText('Nenhum livro emprestado no momento')).toBeInTheDocument();
      });
    });

    it('deve renderizar lista de empréstimos', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getByText('Clean Code')).toBeInTheDocument();
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
    });

    it('deve renderizar botões de devolver', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        const buttons = screen.getAllByText(/Devolver/i);
        expect(buttons).toHaveLength(2);
      });
    });
  });

  describe('Devolução', () => {
    it('deve chamar API ao confirmar devolução', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      axios.put.mockResolvedValue({});
      mockConfirm.mockReturnValue(true);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText(/Devolver/i)).toHaveLength(2);
      });

      fireEvent.click(screen.getAllByText(/Devolver/i)[0]);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('http://localhost:3000/emprestimos/1');
        expect(mockAlert).toHaveBeenCalledWith('✅ Livro devolvido com sucesso!');
      });
    });

    it('não deve chamar API se cancelar', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      mockConfirm.mockReturnValue(false);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText(/Devolver/i)).toHaveLength(2);
      });

      fireEvent.click(screen.getAllByText(/Devolver/i)[0]);

      expect(axios.put).not.toHaveBeenCalled();
    });
  });
});
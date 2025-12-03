import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ListaLivro from '../../components/ListaLivro';

// Mock do axios
vi.mock('axios');

// Mock do window.confirm e window.alert
const mockConfirm = vi.spyOn(window, 'confirm');
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('ListaLivro Component', () => {
  const mockFetchLivro = vi.fn();

  const livrosMock = [
    { _id: '1', titulo: 'Clean Code', autor: 'Robert C. Martin', ano: 2008, categoria: 'Programação', disponivel: true },
    { _id: '2', titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano: 1899, categoria: 'Romance', disponivel: true }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o título', () => {
      render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);
      expect(screen.getByText('Acervo de Livros')).toBeInTheDocument();
    });

    it('deve exibir empty state quando não há livros', () => {
      render(<ListaLivro livros={[]} fetchLivro={mockFetchLivro} />);
      expect(screen.getByText('Nenhum livro cadastrado')).toBeInTheDocument();
    });

    it('deve renderizar lista de livros', () => {
      render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('Robert C. Martin')).toBeInTheDocument();
    });

    it('deve renderizar cabeçalhos da tabela', () => {
      render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);
      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Autor')).toBeInTheDocument();
      expect(screen.getByText('Ano')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('deve renderizar botões de excluir', () => {
      render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);
      const buttons = screen.getAllByText(/Excluir/i);
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Exclusão', () => {
    it('deve chamar API ao confirmar exclusão', async () => {
      axios.delete.mockResolvedValue({});
      mockConfirm.mockReturnValue(true);

      render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

      fireEvent.click(screen.getAllByText(/Excluir/i)[0]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('http://localhost:3000/livros/1');
        expect(mockAlert).toHaveBeenCalledWith('✅ Livro excluído com sucesso!');
        expect(mockFetchLivro).toHaveBeenCalled();
      });
    });

    it('não deve chamar API se cancelar', () => {
      mockConfirm.mockReturnValue(false);

      render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

      fireEvent.click(screen.getAllByText(/Excluir/i)[0]);

      expect(axios.delete).not.toHaveBeenCalled();
    });
  });
});
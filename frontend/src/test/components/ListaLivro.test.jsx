import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ListaLivro from '../../components/ListaLivro';
import { apiURL } from '../../config/environment';

// Mock do axios
vi.mock('axios');

// Mock do window.confirm
const mockConfirm = vi.spyOn(window, 'confirm');
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('ListaLivro Component', () => {
  const mockFetchLivro = vi.fn();
  
  const livrosMock = [
    {
      _id: '1',
      titulo: 'Clean Code',
      autor: 'Robert C. Martin',
      ano: 2008,
      categoria: 'Programação'
    },
    {
      _id: '2',
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      ano: 1899,
      categoria: 'Romance'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a lista de livros corretamente', () => {
    render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

    // Verifica o título
    expect(screen.getByText('US04: Lista de Livros no Acervo')).toBeInTheDocument();

    // Verifica se os livros estão na tela
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Robert C. Martin')).toBeInTheDocument();
    expect(screen.getByText('2008')).toBeInTheDocument();
    expect(screen.getByText('Programação')).toBeInTheDocument();

    expect(screen.getByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.getByText('Machado de Assis')).toBeInTheDocument();
  });

  it('deve renderizar tabela vazia quando não há livros', () => {
    render(<ListaLivro livros={[]} fetchLivro={mockFetchLivro} />);

    // Verifica se não há botões de excluir
    const deleteButtons = screen.queryAllByTestId('button-delete-livro');
    expect(deleteButtons).toHaveLength(0);
  });

  it('deve renderizar botão de excluir para cada livro', () => {
    render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

    const deleteButtons = screen.getAllByText('Excluir');
    expect(deleteButtons).toHaveLength(2);
  });

  it('deve chamar handleDelete ao clicar no botão excluir com confirmação', async () => {
    mockConfirm.mockReturnValue(true);
    axios.delete.mockResolvedValue({});

    render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este livro?');
      expect(axios.delete).toHaveBeenCalledWith(`${apiURL}/livros/1`);
      expect(mockAlert).toHaveBeenCalledWith('Livro excluído com sucesso!');
      expect(mockFetchLivro).toHaveBeenCalled();
    });
  });

  it('não deve excluir livro se usuário cancelar', async () => {
    mockConfirm.mockReturnValue(false);

    render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(axios.delete).not.toHaveBeenCalled();
      expect(mockFetchLivro).not.toHaveBeenCalled();
    });
  });

  it('deve exibir erro ao falhar ao excluir livro', async () => {
    mockConfirm.mockReturnValue(true);
    axios.delete.mockRejectedValue(new Error('Erro de rede'));

    render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Erro ao excluir livro.');
      expect(mockFetchLivro).not.toHaveBeenCalled();
    });
  });

  it('deve renderizar os cabeçalhos da tabela corretamente', () => {
    render(<ListaLivro livros={livrosMock} fetchLivro={mockFetchLivro} />);

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Autor')).toBeInTheDocument();
    expect(screen.getByText('Ano')).toBeInTheDocument();
    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });
});
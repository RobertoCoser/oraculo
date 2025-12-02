import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ListaLeitor from '../../components/ListaLeitor';

// Mock do axios
vi.mock('axios');

// Mock do window.confirm e window.alert
const mockConfirm = vi.spyOn(window, 'confirm');
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('ListaLeitor Component', () => {
  const mockFetchLeitor = vi.fn();

  const leitoresMock = [
    {
      _id: '1',
      nome: 'João Silva',
      contato: 'joao@email.com'
    },
    {
      _id: '2',
      nome: 'Maria Santos',
      contato: '(11) 99999-9999'
    },
    {
      _id: '3',
      nome: 'Pedro Costa',
      contato: 'pedro@email.com'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================
  describe('Renderização', () => {
    it('deve renderizar o título da lista', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      expect(screen.getByText('Lista de Leitores')).toBeInTheDocument();
    });

    it('deve renderizar os cabeçalhos da tabela corretamente', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Contato')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('deve renderizar a lista de leitores corretamente', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('joao@email.com')).toBeInTheDocument();

      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();

      expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
      expect(screen.getByText('pedro@email.com')).toBeInTheDocument();
    });

    it('deve renderizar tabela vazia quando não há leitores', () => {
      render(<ListaLeitor leitores={[]} fetchLeitor={mockFetchLeitor} />);

      const deleteButtons = screen.queryAllByText('Excluir');
      expect(deleteButtons).toHaveLength(0);
    });

    it('deve renderizar botão de excluir para cada leitor', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      const deleteButtons = screen.getAllByText('Excluir');
      expect(deleteButtons).toHaveLength(3);
    });
  });

  // ============================================
  // TESTES DE EXCLUSÃO (US14)
  // ============================================
  describe('Exclusão de Leitor (US14)', () => {
    it('deve exibir confirmação ao clicar no botão excluir', async () => {
      mockConfirm.mockReturnValue(false);

      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      const deleteButtons = screen.getAllByText('Excluir');
      fireEvent.click(deleteButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este leitor?');
    });

    it('deve excluir leitor ao confirmar', async () => {
      mockConfirm.mockReturnValue(true);
      axios.delete.mockResolvedValue({});

      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      const deleteButtons = screen.getAllByText('Excluir');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('http://localhost:3001/leitores/1');
        expect(mockAlert).toHaveBeenCalledWith('Leitor excluído com sucesso!');
        expect(mockFetchLeitor).toHaveBeenCalled();
      });
    });

    it('não deve excluir leitor se usuário cancelar', async () => {
      mockConfirm.mockReturnValue(false);

      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      const deleteButtons = screen.getAllByText('Excluir');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
        expect(axios.delete).not.toHaveBeenCalled();
        expect(mockFetchLeitor).not.toHaveBeenCalled();
      });
    });

    it('deve exibir erro ao falhar ao excluir leitor', async () => {
      mockConfirm.mockReturnValue(true);
      axios.delete.mockRejectedValue(new Error('Erro de rede'));

      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      const deleteButtons = screen.getAllByText('Excluir');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Erro ao excluir leitor.');
        expect(mockFetchLeitor).not.toHaveBeenCalled();
      });
    });

    it('deve excluir o leitor correto quando há múltiplos leitores', async () => {
      mockConfirm.mockReturnValue(true);
      axios.delete.mockResolvedValue({});

      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      const deleteButtons = screen.getAllByText('Excluir');
      
      // Clicar no segundo botão (Maria Santos)
      fireEvent.click(deleteButtons[1]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('http://localhost:3001/leitores/2');
      });
    });
  });

  // ============================================
  // TESTES DE INTEGRAÇÃO
  // ============================================
  describe('Integração', () => {
    it('deve renderizar corretamente com lista atualizada', () => {
      const { rerender } = render(
        <ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />
      );

      expect(screen.getAllByText('Excluir')).toHaveLength(3);

      // Simula atualização da lista (um leitor a menos)
      const leitoresAtualizados = leitoresMock.slice(0, 2);
      rerender(<ListaLeitor leitores={leitoresAtualizados} fetchLeitor={mockFetchLeitor} />);

      expect(screen.getAllByText('Excluir')).toHaveLength(2);
    });

    it('deve exibir novos leitores quando a lista é atualizada', () => {
      const { rerender } = render(
        <ListaLeitor leitores={[]} fetchLeitor={mockFetchLeitor} />
      );

      expect(screen.queryAllByText('Excluir')).toHaveLength(0);

      // Simula adição de leitores
      rerender(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getAllByText('Excluir')).toHaveLength(3);
    });
  });
});
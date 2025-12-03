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
    { _id: '1', nome: 'João Silva', contato: 'joao@email.com' },
    { _id: '2', nome: 'Maria Santos', contato: '(11) 99999-9999' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o título', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);
      expect(screen.getByText('Lista de Leitores')).toBeInTheDocument();
    });

    it('deve exibir empty state quando não há leitores', () => {
      render(<ListaLeitor leitores={[]} fetchLeitor={mockFetchLeitor} />);
      expect(screen.getByText('Nenhum leitor cadastrado')).toBeInTheDocument();
    });

    it('deve renderizar lista de leitores', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    it('deve renderizar cabeçalhos da tabela', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);
      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Contato')).toBeInTheDocument();
    });

    it('deve renderizar botões de excluir', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);
      const buttons = screen.getAllByText(/Excluir/i);
      expect(buttons).toHaveLength(2);
    });

    it('deve exibir ícone de email para contatos com @', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);
      expect(screen.getByText(/📧/)).toBeInTheDocument();
    });

    it('deve exibir ícone de telefone para contatos sem @', () => {
      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);
      expect(screen.getByText(/📱/)).toBeInTheDocument();
    });
  });

  describe('Exclusão', () => {
    it('deve chamar API ao confirmar exclusão', async () => {
      axios.delete.mockResolvedValue({});
      mockConfirm.mockReturnValue(true);

      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      fireEvent.click(screen.getAllByText(/Excluir/i)[0]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('http://localhost:3000/leitores/1');
        expect(mockAlert).toHaveBeenCalledWith('✅ Leitor excluído com sucesso!');
        expect(mockFetchLeitor).toHaveBeenCalled();
      });
    });

    it('não deve chamar API se cancelar', () => {
      mockConfirm.mockReturnValue(false);

      render(<ListaLeitor leitores={leitoresMock} fetchLeitor={mockFetchLeitor} />);

      fireEvent.click(screen.getAllByText(/Excluir/i)[0]);

      expect(axios.delete).not.toHaveBeenCalled();
    });
  });
});
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
      dataEmprestimo: '2025-11-01T10:00:00.000Z',
      status: 'ativo'
    },
    {
      _id: '2',
      nomeLivro: 'O Senhor dos Anéis',
      nomeLeitor: 'Maria Santos',
      dataEmprestimo: '2025-11-15T14:30:00.000Z',
      status: 'ativo'
    },
    {
      _id: '3',
      nomeLivro: 'Dom Casmurro',
      nomeLeitor: 'Pedro Costa',
      dataEmprestimo: '2025-11-20T09:00:00.000Z',
      status: 'ativo'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================
  describe('Renderização', () => {
    it('deve renderizar o título da lista', async () => {
      axios.get.mockResolvedValue({ data: [] });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      expect(screen.getByText('Empréstimos Ativos')).toBeInTheDocument();
    });

    it('deve exibir mensagem quando não há empréstimos', async () => {
      axios.get.mockResolvedValue({ data: [] });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum livro emprestado no momento.')).toBeInTheDocument();
      });
    });

    it('deve renderizar os cabeçalhos da tabela corretamente', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getByText('Livro')).toBeInTheDocument();
        expect(screen.getByText('Leitor')).toBeInTheDocument();
        expect(screen.getByText('Data Empréstimo')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Ações')).toBeInTheDocument();
      });
    });

    it('deve renderizar a lista de empréstimos corretamente', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getByText('Clean Code')).toBeInTheDocument();
        expect(screen.getByText('João Silva')).toBeInTheDocument();

        expect(screen.getByText('O Senhor dos Anéis')).toBeInTheDocument();
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();

        expect(screen.getByText('Dom Casmurro')).toBeInTheDocument();
        expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
      });
    });

    it('deve exibir badge "Emprestado" para cada empréstimo', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        const badges = screen.getAllByText('Emprestado');
        expect(badges).toHaveLength(3);
      });
    });

    it('deve renderizar botão de devolver para cada empréstimo', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        const devolverButtons = screen.getAllByText('Devolver (US07)');
        expect(devolverButtons).toHaveLength(3);
      });
    });

    it('deve formatar a data de empréstimo corretamente', async () => {
      axios.get.mockResolvedValue({ data: [emprestimosMock[0]] });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        // A data deve estar formatada no padrão local
        const dataFormatada = new Date('2025-11-01T10:00:00.000Z').toLocaleDateString();
        expect(screen.getByText(dataFormatada)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // TESTES DE BUSCA DE DADOS
  // ============================================
  describe('Busca de Dados', () => {
    it('deve buscar empréstimos ao montar o componente', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/emprestimos');
      });
    });

    it('deve recarregar empréstimos quando prop recarregar mudar', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });

      const { rerender } = render(
        <ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(1);
      });

      // Simula mudança na prop recarregar
      rerender(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={1} />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });

    it('deve tratar erro ao buscar empréstimos', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockRejectedValue(new Error('Erro de rede'));

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  // ============================================
  // TESTES DE DEVOLUÇÃO (US07)
  // ============================================
  describe('Devolução de Livro (US07)', () => {
    it('deve exibir confirmação ao clicar no botão devolver', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      mockConfirm.mockReturnValue(false);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(3);
      });

      const devolverButtons = screen.getAllByText('Devolver (US07)');
      fireEvent.click(devolverButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith('Confirmar a devolução deste livro?');
    });

    it('deve registrar devolução ao confirmar', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      axios.put.mockResolvedValue({});
      mockConfirm.mockReturnValue(true);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(3);
      });

      const devolverButtons = screen.getAllByText('Devolver (US07)');
      fireEvent.click(devolverButtons[0]);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('http://localhost:3001/emprestimos/1');
        expect(mockAlert).toHaveBeenCalledWith('Livro devolvido com sucesso!');
        expect(mockOnDevolucao).toHaveBeenCalled();
      });
    });

    it('não deve registrar devolução se usuário cancelar', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      mockConfirm.mockReturnValue(false);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(3);
      });

      const devolverButtons = screen.getAllByText('Devolver (US07)');
      fireEvent.click(devolverButtons[0]);

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
        expect(axios.put).not.toHaveBeenCalled();
        expect(mockOnDevolucao).not.toHaveBeenCalled();
      });
    });

    it('deve exibir erro ao falhar ao registrar devolução', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      axios.put.mockRejectedValue(new Error('Erro de rede'));
      mockConfirm.mockReturnValue(true);

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(3);
      });

      const devolverButtons = screen.getAllByText('Devolver (US07)');
      fireEvent.click(devolverButtons[0]);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Erro ao registrar devolução.');
        expect(mockOnDevolucao).not.toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('deve devolver o empréstimo correto quando há múltiplos', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      axios.put.mockResolvedValue({});
      mockConfirm.mockReturnValue(true);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(3);
      });

      const devolverButtons = screen.getAllByText('Devolver (US07)');
      
      // Clicar no segundo botão (O Senhor dos Anéis)
      fireEvent.click(devolverButtons[1]);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('http://localhost:3001/emprestimos/2');
      });
    });

    it('deve recarregar lista após devolução bem-sucedida', async () => {
      axios.get.mockResolvedValue({ data: emprestimosMock });
      axios.put.mockResolvedValue({});
      mockConfirm.mockReturnValue(true);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(1);
      });

      const devolverButtons = screen.getAllByText('Devolver (US07)');
      fireEvent.click(devolverButtons[0]);

      await waitFor(() => {
        // Deve ter chamado GET duas vezes (montagem + após devolução)
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================
  // TESTES DE INTEGRAÇÃO
  // ============================================
  describe('Integração', () => {
    it('deve atualizar lista quando novos empréstimos são adicionados', async () => {
      axios.get
        .mockResolvedValueOnce({ data: [emprestimosMock[0]] })
        .mockResolvedValueOnce({ data: emprestimosMock });

      const { rerender } = render(
        <ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />
      );

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(1);
      });

      // Simula novo empréstimo adicionado (recarregar muda)
      rerender(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={1} />);

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(3);
      });
    });

    it('deve exibir mensagem vazia quando todos empréstimos são devolvidos', async () => {
      axios.get
        .mockResolvedValueOnce({ data: emprestimosMock })
        .mockResolvedValueOnce({ data: [] });
      axios.put.mockResolvedValue({});
      mockConfirm.mockReturnValue(true);

      render(<ListaEmprestimos onDevolucao={mockOnDevolucao} recarregar={0} />);

      await waitFor(() => {
        expect(screen.getAllByText('Devolver (US07)')).toHaveLength(3);
      });

      // Simula devolução
      const devolverButtons = screen.getAllByText('Devolver (US07)');
      fireEvent.click(devolverButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Nenhum livro emprestado no momento.')).toBeInTheDocument();
      });
    });
  });
});
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
    { _id: '2', titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', disponivel: true },
    { _id: '3', titulo: 'Dom Casmurro', autor: 'Machado de Assis', disponivel: false }
  ];

  const leitoresMock = [
    { _id: 'a1', nome: 'João Silva', contato: 'joao@email.com' },
    { _id: 'a2', nome: 'Maria Santos', contato: '(11) 99999-9999' },
    { _id: 'a3', nome: 'Pedro Costa', contato: 'pedro@email.com' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================
  describe('Renderização', () => {
    it('deve renderizar o título do formulário', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('US06: Registrar Empréstimo')).toBeInTheDocument();
    });

    it('deve renderizar os selects de livro e leitor', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByLabelText('Selecione o Livro')).toBeInTheDocument();
      expect(screen.getByLabelText('Selecione o Leitor')).toBeInTheDocument();
    });

    it('deve renderizar o botão de emprestar', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByRole('button', { name: 'Emprestar' })).toBeInTheDocument();
    });

    it('deve exibir opção padrão no select de livros', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('-- Escolha um Livro Disponível --')).toBeInTheDocument();
    });

    it('deve exibir opção padrão no select de leitores', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('-- Escolha um Leitor --')).toBeInTheDocument();
    });

    it('deve exibir apenas livros disponíveis no dropdown', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Livros disponíveis devem aparecer
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('O Senhor dos Anéis')).toBeInTheDocument();
      
      // Livro indisponível não deve aparecer
      expect(screen.queryByText('Dom Casmurro')).not.toBeInTheDocument();
    });

    it('deve exibir todos os leitores no dropdown', () => {
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
    });

    it('deve renderizar com listas vazias', () => {
      render(
        <FormularioEmprestimo
          livros={[]}
          leitores={[]}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('US06: Registrar Empréstimo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Emprestar' })).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE INTERAÇÃO
  // ============================================
  describe('Interação com selects', () => {
    it('deve atualizar select de livro ao selecionar', async () => {
      const user = userEvent.setup();
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      const selectLivro = screen.getByLabelText('Selecione o Livro');
      await user.selectOptions(selectLivro, '1');

      expect(selectLivro).toHaveValue('1');
    });

    it('deve atualizar select de leitor ao selecionar', async () => {
      const user = userEvent.setup();
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      const selectLeitor = screen.getByLabelText('Selecione o Leitor');
      await user.selectOptions(selectLeitor, 'a1');

      expect(selectLeitor).toHaveValue('a1');
    });

    it('deve permitir mudar seleção de livro', async () => {
      const user = userEvent.setup();
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      const selectLivro = screen.getByLabelText('Selecione o Livro');
      
      await user.selectOptions(selectLivro, '1');
      expect(selectLivro).toHaveValue('1');
      
      await user.selectOptions(selectLivro, '2');
      expect(selectLivro).toHaveValue('2');
    });

    it('deve permitir mudar seleção de leitor', async () => {
      const user = userEvent.setup();
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      const selectLeitor = screen.getByLabelText('Selecione o Leitor');
      
      await user.selectOptions(selectLeitor, 'a1');
      expect(selectLeitor).toHaveValue('a1');
      
      await user.selectOptions(selectLeitor, 'a2');
      expect(selectLeitor).toHaveValue('a2');
    });
  });

  // ============================================
  // TESTES DE VALIDAÇÃO
  // ============================================
  describe('Validação', () => {
    it('deve exibir alerta se nenhum livro for selecionado', async () => {
      const user = userEvent.setup();
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Seleciona apenas leitor
      const selectLeitor = screen.getByLabelText('Selecione o Leitor');
      await user.selectOptions(selectLeitor, 'a1');

      // Tenta submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      expect(mockAlert).toHaveBeenCalledWith('Selecione um livro e um leitor!');
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('deve exibir alerta se nenhum leitor for selecionado', async () => {
      const user = userEvent.setup();
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Seleciona apenas livro
      const selectLivro = screen.getByLabelText('Selecione o Livro');
      await user.selectOptions(selectLivro, '1');

      // Tenta submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      expect(mockAlert).toHaveBeenCalledWith('Selecione um livro e um leitor!');
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('deve exibir alerta se nenhum campo for selecionado', async () => {
      const user = userEvent.setup();
      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Tenta submeter sem selecionar nada
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      expect(mockAlert).toHaveBeenCalledWith('Selecione um livro e um leitor!');
      expect(axios.post).not.toHaveBeenCalled();
      expect(mockOnEmprestimoRealizado).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // TESTES DE ENVIO (US06)
  // ============================================
  describe('Envio do Formulário (US06)', () => {
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

      // Selecionar livro e leitor
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '1');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a1');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3001/emprestimos',
          {
            idLivro: '1',
            idLeitor: 'a1'
          }
        );
        expect(mockAlert).toHaveBeenCalledWith('Empréstimo registrado!');
        expect(mockOnEmprestimoRealizado).toHaveBeenCalled();
      });
    });

    it('deve limpar seleções após empréstimo bem-sucedido', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: 'emp123' } });

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Selecionar livro e leitor
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '1');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a1');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Selecione o Livro')).toHaveValue('');
        expect(screen.getByLabelText('Selecione o Leitor')).toHaveValue('');
      });
    });

    it('deve exibir erro genérico ao falhar no empréstimo', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue(new Error('Erro de rede'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Selecionar livro e leitor
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '1');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a1');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Erro ao realizar empréstimo.');
        expect(mockOnEmprestimoRealizado).not.toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('deve exibir mensagem de erro do backend', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue({
        response: { data: { message: 'Livro já emprestado' } }
      });
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Selecionar livro e leitor
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '1');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a1');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Livro já emprestado');
        expect(mockOnEmprestimoRealizado).not.toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('não deve limpar seleções após erro', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue(new Error('Erro'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Selecionar livro e leitor
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '1');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a1');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Selecione o Livro')).toHaveValue('1');
        expect(screen.getByLabelText('Selecione o Leitor')).toHaveValue('a1');
      });

      consoleError.mockRestore();
    });

    it('deve enviar os IDs corretos para diferentes seleções', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: 'emp456' } });

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Selecionar segundo livro e terceiro leitor
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '2');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a3');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3001/emprestimos',
          {
            idLivro: '2',
            idLeitor: 'a3'
          }
        );
      });
    });
  });

  // ============================================
  // TESTES DE INTEGRAÇÃO
  // ============================================
  describe('Integração', () => {
    it('deve permitir múltiplos empréstimos em sequência', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: 'emp123' } });

      render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      // Primeiro empréstimo
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '1');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a1');
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(1);
      });

      // Segundo empréstimo
      await user.selectOptions(screen.getByLabelText('Selecione o Livro'), '2');
      await user.selectOptions(screen.getByLabelText('Selecione o Leitor'), 'a2');
      await user.click(screen.getByRole('button', { name: 'Emprestar' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(2);
        expect(mockOnEmprestimoRealizado).toHaveBeenCalledTimes(2);
      });
    });

    it('deve atualizar quando props mudam', () => {
      const { rerender } = render(
        <FormularioEmprestimo
          livros={livrosMock}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('Clean Code')).toBeInTheDocument();

      // Atualiza lista de livros (remove um livro disponível)
      const novosLivros = [
        { _id: '4', titulo: 'Novo Livro', autor: 'Novo Autor', disponivel: true }
      ];

      rerender(
        <FormularioEmprestimo
          livros={novosLivros}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
      expect(screen.getByText('Novo Livro')).toBeInTheDocument();
    });

    it('deve funcionar com todos os livros disponíveis', () => {
      const todosDisponiveis = [
        { _id: '1', titulo: 'Livro 1', disponivel: true },
        { _id: '2', titulo: 'Livro 2', disponivel: true },
        { _id: '3', titulo: 'Livro 3', disponivel: true }
      ];

      render(
        <FormularioEmprestimo
          livros={todosDisponiveis}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.getByText('Livro 1')).toBeInTheDocument();
      expect(screen.getByText('Livro 2')).toBeInTheDocument();
      expect(screen.getByText('Livro 3')).toBeInTheDocument();
    });

    it('deve funcionar com nenhum livro disponível', () => {
      const nenhumDisponivel = [
        { _id: '1', titulo: 'Livro 1', disponivel: false },
        { _id: '2', titulo: 'Livro 2', disponivel: false }
      ];

      render(
        <FormularioEmprestimo
          livros={nenhumDisponivel}
          leitores={leitoresMock}
          onEmprestimoRealizado={mockOnEmprestimoRealizado}
        />
      );

      expect(screen.queryByText('Livro 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Livro 2')).not.toBeInTheDocument();
    });
  });
});
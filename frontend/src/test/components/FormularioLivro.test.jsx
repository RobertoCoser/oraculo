import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import FormularioLivro from '../../components/FormularioLivro';

// Mock do axios
vi.mock('axios');

// Mock do window.alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('FormularioLivro Component', () => {
  const mockOnLivroCadastrado = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================
  describe('Renderização', () => {
    it('deve renderizar o título do formulário', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      expect(screen.getByText('US01: Cadastrar Novo Livro')).toBeInTheDocument();
    });

    it('deve renderizar todos os campos do formulário', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      expect(screen.getByLabelText('Título')).toBeInTheDocument();
      expect(screen.getByLabelText('Autor')).toBeInTheDocument();
      expect(screen.getByLabelText('Ano')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    });

    it('deve renderizar o botão de cadastrar', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      expect(screen.getByRole('button', { name: 'Cadastrar Livro' })).toBeInTheDocument();
    });

    it('deve iniciar com campos vazios', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      expect(screen.getByLabelText('Título')).toHaveValue('');
      expect(screen.getByLabelText('Autor')).toHaveValue('');
      expect(screen.getByLabelText('Ano')).toHaveValue(null);
      expect(screen.getByLabelText('Categoria')).toHaveValue('');
    });

    it('deve ter campos obrigatórios', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      expect(screen.getByLabelText('Título')).toBeRequired();
      expect(screen.getByLabelText('Autor')).toBeRequired();
      expect(screen.getByLabelText('Ano')).toBeRequired();
      expect(screen.getByLabelText('Categoria')).toBeRequired();
    });
  });

  // ============================================
  // TESTES DE INTERAÇÃO
  // ============================================
  describe('Interação com campos', () => {
    it('deve atualizar campo título ao digitar', async () => {
      const user = userEvent.setup();
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      const tituloInput = screen.getByLabelText('Título');
      await user.type(tituloInput, 'Clean Code');

      expect(tituloInput).toHaveValue('Clean Code');
    });

    it('deve atualizar campo autor ao digitar', async () => {
      const user = userEvent.setup();
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      const autorInput = screen.getByLabelText('Autor');
      await user.type(autorInput, 'Robert C. Martin');

      expect(autorInput).toHaveValue('Robert C. Martin');
    });

    it('deve atualizar campo ano ao digitar', async () => {
      const user = userEvent.setup();
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      const anoInput = screen.getByLabelText('Ano');
      await user.type(anoInput, '2008');

      expect(anoInput).toHaveValue(2008);
    });

    it('deve atualizar campo categoria ao digitar', async () => {
      const user = userEvent.setup();
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      const categoriaInput = screen.getByLabelText('Categoria');
      await user.type(categoriaInput, 'Programação');

      expect(categoriaInput).toHaveValue('Programação');
    });
  });

  // ============================================
  // TESTES DE ENVIO (US01)
  // ============================================
  describe('Envio do Formulário (US01)', () => {
    it('deve cadastrar livro com sucesso', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Título'), 'Clean Code');
      await user.type(screen.getByLabelText('Autor'), 'Robert C. Martin');
      await user.type(screen.getByLabelText('Ano'), '2008');
      await user.type(screen.getByLabelText('Categoria'), 'Programação');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Livro' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/livros',
          {
            titulo: 'Clean Code',
            autor: 'Robert C. Martin',
            ano: 2008,
            categoria: 'Programação'
          }
        );
        expect(mockAlert).toHaveBeenCalledWith('Livro cadastrado com sucesso!');
        expect(mockOnLivroCadastrado).toHaveBeenCalled();
      });
    });

    it('deve limpar campos após cadastro bem-sucedido', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Título'), 'Clean Code');
      await user.type(screen.getByLabelText('Autor'), 'Robert C. Martin');
      await user.type(screen.getByLabelText('Ano'), '2008');
      await user.type(screen.getByLabelText('Categoria'), 'Programação');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Livro' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Título')).toHaveValue('');
        expect(screen.getByLabelText('Autor')).toHaveValue('');
        expect(screen.getByLabelText('Ano')).toHaveValue(null);
        expect(screen.getByLabelText('Categoria')).toHaveValue('');
      });
    });

    it('deve exibir erro ao falhar no cadastro', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue(new Error('Erro de rede'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Título'), 'Livro Teste');
      await user.type(screen.getByLabelText('Autor'), 'Autor Teste');
      await user.type(screen.getByLabelText('Ano'), '2020');
      await user.type(screen.getByLabelText('Categoria'), 'Teste');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Livro' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Erro ao cadastrar livro.');
        expect(mockOnLivroCadastrado).not.toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('não deve limpar campos após erro no cadastro', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue(new Error('Erro de rede'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Título'), 'Livro Teste');
      await user.type(screen.getByLabelText('Autor'), 'Autor Teste');
      await user.type(screen.getByLabelText('Ano'), '2020');
      await user.type(screen.getByLabelText('Categoria'), 'Teste');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Livro' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Título')).toHaveValue('Livro Teste');
        expect(screen.getByLabelText('Autor')).toHaveValue('Autor Teste');
        expect(screen.getByLabelText('Ano')).toHaveValue(2020);
        expect(screen.getByLabelText('Categoria')).toHaveValue('Teste');
      });

      consoleError.mockRestore();
    });

    it('deve converter ano para número inteiro', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Título'), 'Livro');
      await user.type(screen.getByLabelText('Autor'), 'Autor');
      await user.type(screen.getByLabelText('Ano'), '2023');
      await user.type(screen.getByLabelText('Categoria'), 'Categoria');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Livro' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            ano: 2023 // Deve ser número, não string
          })
        );
      });
    });
  });

  // ============================================
  // TESTES DE VALIDAÇÃO
  // ============================================
  describe('Validação', () => {
    it('deve ter campo de ano do tipo number', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      const anoInput = screen.getByLabelText('Ano');
      expect(anoInput).toHaveAttribute('type', 'number');
    });

    it('deve ter campos de texto do tipo text', () => {
      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      expect(screen.getByLabelText('Título')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Autor')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Categoria')).toHaveAttribute('type', 'text');
    });
  });

  // ============================================
  // TESTES DE INTEGRAÇÃO
  // ============================================
  describe('Integração', () => {
    it('deve permitir cadastrar múltiplos livros em sequência', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLivro onLivroCadastrado={mockOnLivroCadastrado} />);

      // Primeiro livro
      await user.type(screen.getByLabelText('Título'), 'Livro 1');
      await user.type(screen.getByLabelText('Autor'), 'Autor 1');
      await user.type(screen.getByLabelText('Ano'), '2020');
      await user.type(screen.getByLabelText('Categoria'), 'Ficção');
      await user.click(screen.getByRole('button', { name: 'Cadastrar Livro' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(1);
      });

      // Segundo livro (campos devem estar limpos)
      await user.type(screen.getByLabelText('Título'), 'Livro 2');
      await user.type(screen.getByLabelText('Autor'), 'Autor 2');
      await user.type(screen.getByLabelText('Ano'), '2021');
      await user.type(screen.getByLabelText('Categoria'), 'Romance');
      await user.click(screen.getByRole('button', { name: 'Cadastrar Livro' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(2);
        expect(mockOnLivroCadastrado).toHaveBeenCalledTimes(2);
      });
    });
  });
});
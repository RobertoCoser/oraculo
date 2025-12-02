import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import FormularioLeitor from '../../components/FormularioLeitor';

// Mock do axios
vi.mock('axios');

// Mock do window.alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('FormularioLeitor Component', () => {
  const mockOnLeitorSalvo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================
  describe('Renderização', () => {
    it('deve renderizar o título do formulário', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByText('US12: Cadastrar Novo Leitor')).toBeInTheDocument();
    });

    it('deve renderizar todos os campos do formulário', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByLabelText('Nome do Leitor')).toBeInTheDocument();
      expect(screen.getByLabelText('Contato (Email ou Telefone)')).toBeInTheDocument();
    });

    it('deve renderizar o botão de cadastrar', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByRole('button', { name: 'Cadastrar Leitor' })).toBeInTheDocument();
    });

    it('deve iniciar com campos vazios', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByLabelText('Nome do Leitor')).toHaveValue('');
      expect(screen.getByLabelText('Contato (Email ou Telefone)')).toHaveValue('');
    });

    it('deve ter campos obrigatórios', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByLabelText('Nome do Leitor')).toBeRequired();
      expect(screen.getByLabelText('Contato (Email ou Telefone)')).toBeRequired();
    });

    it('deve ter placeholders corretos', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByPlaceholderText('Digite o nome')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite o contato')).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE INTERAÇÃO
  // ============================================
  describe('Interação com campos', () => {
    it('deve atualizar campo nome ao digitar', async () => {
      const user = userEvent.setup();
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      const nomeInput = screen.getByLabelText('Nome do Leitor');
      await user.type(nomeInput, 'João Silva');

      expect(nomeInput).toHaveValue('João Silva');
    });

    it('deve atualizar campo contato ao digitar email', async () => {
      const user = userEvent.setup();
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      const contatoInput = screen.getByLabelText('Contato (Email ou Telefone)');
      await user.type(contatoInput, 'joao@email.com');

      expect(contatoInput).toHaveValue('joao@email.com');
    });

    it('deve atualizar campo contato ao digitar telefone', async () => {
      const user = userEvent.setup();
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      const contatoInput = screen.getByLabelText('Contato (Email ou Telefone)');
      await user.type(contatoInput, '(11) 99999-9999');

      expect(contatoInput).toHaveValue('(11) 99999-9999');
    });
  });

  // ============================================
  // TESTES DE ENVIO (US12)
  // ============================================
  describe('Envio do Formulário (US12)', () => {
    it('deve cadastrar leitor com sucesso usando email', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Nome do Leitor'), 'João Silva');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'joao@email.com');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3001/leitores',
          {
            nome: 'João Silva',
            contato: 'joao@email.com'
          }
        );
        expect(mockAlert).toHaveBeenCalledWith('Leitor cadastrado com sucesso!');
        expect(mockOnLeitorSalvo).toHaveBeenCalled();
      });
    });

    it('deve cadastrar leitor com sucesso usando telefone', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '456' } });

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Nome do Leitor'), 'Maria Santos');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), '(11) 98765-4321');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3001/leitores',
          {
            nome: 'Maria Santos',
            contato: '(11) 98765-4321'
          }
        );
        expect(mockAlert).toHaveBeenCalledWith('Leitor cadastrado com sucesso!');
        expect(mockOnLeitorSalvo).toHaveBeenCalled();
      });
    });

    it('deve limpar campos após cadastro bem-sucedido', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Nome do Leitor'), 'João Silva');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'joao@email.com');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Nome do Leitor')).toHaveValue('');
        expect(screen.getByLabelText('Contato (Email ou Telefone)')).toHaveValue('');
      });
    });

    it('deve exibir erro ao falhar no cadastro', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue(new Error('Erro de rede'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Nome do Leitor'), 'Leitor Teste');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'teste@email.com');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Erro ao cadastrar leitor.');
        expect(mockOnLeitorSalvo).not.toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('não deve limpar campos após erro no cadastro', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValue(new Error('Erro de rede'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Nome do Leitor'), 'Leitor Teste');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'teste@email.com');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Nome do Leitor')).toHaveValue('Leitor Teste');
        expect(screen.getByLabelText('Contato (Email ou Telefone)')).toHaveValue('teste@email.com');
      });

      consoleError.mockRestore();
    });

    it('deve chamar onLeitorSalvo apenas uma vez após sucesso', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Preencher formulário
      await user.type(screen.getByLabelText('Nome do Leitor'), 'João Silva');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'joao@email.com');

      // Submeter
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(mockOnLeitorSalvo).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ============================================
  // TESTES DE VALIDAÇÃO
  // ============================================
  describe('Validação', () => {
    it('deve ter campos do tipo text', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByLabelText('Nome do Leitor')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Contato (Email ou Telefone)')).toHaveAttribute('type', 'text');
    });

    it('deve ter botão do tipo submit', () => {
      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      expect(screen.getByRole('button', { name: 'Cadastrar Leitor' })).toHaveAttribute('type', 'submit');
    });
  });

  // ============================================
  // TESTES DE INTEGRAÇÃO
  // ============================================
  describe('Integração', () => {
    it('deve permitir cadastrar múltiplos leitores em sequência', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Primeiro leitor
      await user.type(screen.getByLabelText('Nome do Leitor'), 'João Silva');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'joao@email.com');
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(1);
      });

      // Segundo leitor (campos devem estar limpos)
      await user.type(screen.getByLabelText('Nome do Leitor'), 'Maria Santos');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), '(11) 99999-9999');
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(2);
        expect(mockOnLeitorSalvo).toHaveBeenCalledTimes(2);
      });
    });

    it('deve enviar dados corretos para cada cadastro', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({ data: { insertedId: '123' } });

      render(<FormularioLeitor onLeitorSalvo={mockOnLeitorSalvo} />);

      // Primeiro leitor
      await user.type(screen.getByLabelText('Nome do Leitor'), 'João Silva');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'joao@email.com');
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenLastCalledWith(
          'http://localhost:3001/leitores',
          { nome: 'João Silva', contato: 'joao@email.com' }
        );
      });

      // Segundo leitor
      await user.type(screen.getByLabelText('Nome do Leitor'), 'Pedro Costa');
      await user.type(screen.getByLabelText('Contato (Email ou Telefone)'), 'pedro@email.com');
      await user.click(screen.getByRole('button', { name: 'Cadastrar Leitor' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenLastCalledWith(
          'http://localhost:3001/leitores',
          { nome: 'Pedro Costa', contato: 'pedro@email.com' }
        );
      });
    });
  });
});
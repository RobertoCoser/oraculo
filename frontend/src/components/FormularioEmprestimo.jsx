import { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function FormularioEmprestimo({ livros, leitores, onEmprestimoRealizado }) {
    const [idLivroSelecionado, setIdLivroSelecionado] = useState('');
    const [idLeitorSelecionado, setIdLeitorSelecionado] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!idLivroSelecionado || !idLeitorSelecionado) {
            alert('⚠️ Selecione um livro e um leitor!');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${apiURL}/emprestimos`, {
                idLivro: idLivroSelecionado,
                idLeitor: idLeitorSelecionado
            });
            alert('✅ Empréstimo registrado!');
            setIdLivroSelecionado('');
            setIdLeitorSelecionado('');
            if (onEmprestimoRealizado) onEmprestimoRealizado();
        } catch (error) {
            console.error(error);
            const mensagem = error.response?.data?.message || 'Erro ao realizar empréstimo.';
            alert(`❌ ${mensagem}`);
        } finally {
            setLoading(false);
        }
    };

    const livrosDisponiveis = livros.filter(livro => livro.disponivel !== false);

    return (
        <>
            <div className="section-title">
                <span className="section-icon">📤</span>
                <h5>Registrar Empréstimo</h5>
            </div>

            {livrosDisponiveis.length === 0 && (
                <Alert variant="warning" className="mb-3">
                    ⚠️ Não há livros disponíveis para empréstimo no momento.
                </Alert>
            )}

            {leitores.length === 0 && (
                <Alert variant="info" className="mb-3">
                    ℹ️ Cadastre leitores antes de realizar empréstimos.
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>📖 Selecione o Livro</Form.Label>
                            <Form.Select
                                value={idLivroSelecionado}
                                onChange={(e) => setIdLivroSelecionado(e.target.value)}
                                required
                            >
                                <option value="">-- Escolha um Livro Disponível --</option>
                                {livrosDisponiveis.map((livro) => (
                                    <option key={livro._id} value={livro._id}>
                                        {livro.titulo} - {livro.autor}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>👤 Selecione o Leitor</Form.Label>
                            <Form.Select
                                value={idLeitorSelecionado}
                                onChange={(e) => setIdLeitorSelecionado(e.target.value)}
                                required
                            >
                                <option value="">-- Escolha um Leitor --</option>
                                {leitores.map((leitor) => (
                                    <option key={leitor._id} value={leitor._id}>
                                        {leitor.nome}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100"
                    disabled={loading || livrosDisponiveis.length === 0 || leitores.length === 0}
                >
                    {loading ? (
                        <>⏳ Processando...</>
                    ) : (
                        <>📤 Realizar Empréstimo</>
                    )}
                </Button>
            </Form>
        </>
    );
}

export default FormularioEmprestimo;
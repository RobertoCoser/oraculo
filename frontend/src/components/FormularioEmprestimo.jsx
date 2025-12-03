import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { apiURL } from '../config/environment';

// Recebe as listas e a função para recarregar tudo após o empréstimo
function FormularioEmprestimo({ livros, leitores, onEmprestimoRealizado }) {
    const [idLivroSelecionado, setIdLivroSelecionado] = useState('');
    const [idLeitorSelecionado, setIdLeitorSelecionado] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!idLivroSelecionado || !idLeitorSelecionado) {
            alert('Selecione um livro e um leitor!');
            return;
        }

        try {
            await axios.post(`${apiURL}/emprestimos`, {
                idLivro: idLivroSelecionado,
                idLeitor: idLeitorSelecionado
            });

            alert('Empréstimo registrado!');

            // Limpa a seleção
            setIdLivroSelecionado('');
            setIdLeitorSelecionado('');

            // Avisa o pai para recarregar as listas (para o livro sumir dos disponíveis)
            onEmprestimoRealizado();

        } catch (error) {
            console.error('Erro ao emprestar:', error);
            // Mostra mensagem de erro vinda do backend (ex: Livro já emprestado)
            alert(error.response?.data?.message || 'Erro ao realizar empréstimo.');
        }
    };

    // Filtra apenas livros disponíveis para aparecer no dropdown
    // (Ou mostra todos, mas indica se está indisponível)
    const livrosDisponiveis = livros.filter(livro => livro.disponivel !== false);

    return (
        <Container className="mt-4 p-4 border rounded bg-light">
            <h3 className="text-center mb-4">US06: Registrar Empréstimo</h3>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={5}>
                        <Form.Group controlId="selectLivro">
                            <Form.Label>Selecione o Livro</Form.Label>
                            <Form.Select
                                value={idLivroSelecionado}
                                onChange={e => setIdLivroSelecionado(e.target.value)}
                            >
                                <option value="">-- Escolha um Livro Disponível --</option>
                                {livrosDisponiveis.map(livro => (
                                    <option key={livro._id} value={livro._id}>
                                        {livro.titulo}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={5}>
                        <Form.Group controlId="selectLeitor">
                            <Form.Label>Selecione o Leitor</Form.Label>
                            <Form.Select
                                value={idLeitorSelecionado}
                                onChange={e => setIdLeitorSelecionado(e.target.value)}
                            >
                                <option value="">-- Escolha um Leitor --</option>
                                {leitores.map(leitor => (
                                    <option key={leitor._id} value={leitor._id}>
                                        {leitor.nome}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={2} className="d-flex align-items-end">
                        <Button variant="success" type="submit" className="w-100">
                            Emprestar
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FormularioEmprestimo;
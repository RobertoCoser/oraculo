import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { apiURL } from '../config/environment';

function FormularioLivro({ onLivroCadastrado }) {
    const [titulo, setTitulo] = useState('');
    const [autor, setAutor] = useState('');
    const [ano, setAno] = useState('');
    const [categoria, setCategoria] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const novoLivro = {
            titulo: titulo,
            autor: autor,
            ano: parseInt(ano),
            categoria: categoria
        };

        try {
            await axios.post(`${apiURL}/livros`, novoLivro);
            alert('Livro cadastrado com sucesso!');

            setTitulo('');
            setAutor('');
            setAno('');
            setCategoria('');

            onLivroCadastrado();

        } catch (error) {
            console.error('Erro ao cadastrar livro:', error);
            alert('Erro ao cadastrar livro.');
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center mt-5">
                <Col md={6}>
                    <h2>US01: Cadastrar Novo Livro</h2>
                    <Form onSubmit={handleSubmit}>

                        <Form.Group className="mb-3" controlId="formTitulo">
                            <Form.Label>Título</Form.Label>
                            <Form.Control
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formAutor">
                            <Form.Label>Autor</Form.Label>
                            <Form.Control
                                type="text"
                                value={autor}
                                onChange={(e) => setAutor(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formAno">
                            <Form.Label>Ano</Form.Label>
                            <Form.Control
                                type="number"
                                value={ano}
                                onChange={(e) => setAno(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCategoria">
                            <Form.Label>Categoria</Form.Label>
                            <Form.Control
                                type="text"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Cadastrar Livro
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default FormularioLivro;
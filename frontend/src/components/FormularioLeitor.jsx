import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { apiURL } from '../config/environment';

// Recebe a função 'onLeitorSalvo' do App.jsx
function FormularioLeitor({ onLeitorSalvo }) {
    const [nome, setNome] = useState('');
    const [contato, setContato] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const novoLeitor = { nome, contato };

        try {
            // Envia os dados para o backend (US12)
            await axios.post(`${apiURL}/leitores`, novoLeitor);

            alert('Leitor cadastrado com sucesso!');

            // Limpa o formulário
            setNome('');
            setContato('');

            // Avisa o App.jsx para recarregar a lista
            onLeitorSalvo();

        } catch (error) {
            console.error('Erro ao cadastrar leitor:', error);
            alert('Erro ao cadastrar leitor.');
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center mt-5">
                <Col md={12}>
                    <h2>US12: Cadastrar Novo Leitor</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formNomeLeitor">
                            <Form.Label>Nome do Leitor</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite o nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formContatoLeitor">
                            <Form.Label>Contato (Email ou Telefone)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite o contato"
                                value={contato}
                                onChange={(e) => setContato(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Cadastrar Leitor
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default FormularioLeitor;
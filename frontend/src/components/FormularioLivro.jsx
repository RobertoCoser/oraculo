import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function FormularioLivro({ onLivroCadastrado }) {
    const [titulo, setTitulo] = useState('');
    const [autor, setAutor] = useState('');
    const [ano, setAno] = useState('');
    const [categoria, setCategoria] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        
        const novoLivro = { titulo, autor, ano: parseInt(ano), categoria };

        try {
            await axios.post(`${apiURL}/livros`, novoLivro);
            alert('✅ Livro cadastrado com sucesso!');
            setTitulo('');
            setAutor('');
            setAno('');
            setCategoria('');
            if (onLivroCadastrado) onLivroCadastrado();
        } catch (error) {
            console.error(error);
            alert('❌ Erro ao cadastrar livro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="section-title">
                <span className="section-icon">📖</span>
                <h5>Cadastrar Novo Livro</h5>
            </div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Título</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Digite o título do livro"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Autor</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Digite o nome do autor"
                        value={autor}
                        onChange={(e) => setAutor(e.target.value)}
                        required
                    />
                </Form.Group>

                <Row>
                    <Col sm={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ano</Form.Label>
                            <Form.Control 
                                type="number"
                                placeholder="Ex: 2023"
                                value={ano}
                                onChange={(e) => setAno(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Categoria</Form.Label>
                            <Form.Control 
                                type="text"
                                placeholder="Ex: Romance"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100"
                    disabled={loading}
                >
                    {loading ? (
                        <>⏳ Cadastrando...</>
                    ) : (
                        <>➕ Cadastrar Livro</>
                    )}
                </Button>
            </Form>
        </>
    );
}

export default FormularioLivro;
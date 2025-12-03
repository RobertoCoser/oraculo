import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function FormularioLeitor({ onLeitorSalvo }) {
    const [nome, setNome] = useState('');
    const [contato, setContato] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        
        const novoLeitor = { nome, contato };

        try {
            await axios.post(`${apiURL}/leitores`, novoLeitor);
            alert('✅ Leitor cadastrado com sucesso!');
            setNome('');
            setContato('');
            if (onLeitorSalvo) onLeitorSalvo();
        } catch (error) {
            console.error(error);
            alert('❌ Erro ao cadastrar leitor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="section-title">
                <span className="section-icon">👤</span>
                <h5>Cadastrar Novo Leitor</h5>
            </div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nome do Leitor</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Digite o nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Contato (Email ou Telefone)</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Ex: email@exemplo.com ou (11) 99999-9999"
                        value={contato}
                        onChange={(e) => setContato(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button 
                    variant="success" 
                    type="submit" 
                    className="w-100"
                    disabled={loading}
                >
                    {loading ? (
                        <>⏳ Cadastrando...</>
                    ) : (
                        <>➕ Cadastrar Leitor</>
                    )}
                </Button>
            </Form>
        </>
    );
}

export default FormularioLeitor;
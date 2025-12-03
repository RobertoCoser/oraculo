import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Badge } from 'react-bootstrap';
import axios from 'axios';
import { apiURL } from '../config/environment';

// Recebe a função 'onDevolucao' para avisar o App que deve recarregar tudo
function ListaEmprestimos({ onDevolucao, recarregar }) {
    const [emprestimos, setEmprestimos] = useState([]);

    // Busca os empréstimos ativos sempre que a prop 'recarregar' mudar
    useEffect(() => {
        fetchEmprestimos();
    }, [recarregar]);

    const fetchEmprestimos = async () => {
        try {
            const response = await axios.get(`${apiURL}/emprestimos`);
            setEmprestimos(response.data);
        } catch (error) {
            console.error('Erro ao buscar empréstimos:', error);
        }
    };

    const handleDevolucao = async (id) => {
        if (window.confirm('Confirmar a devolução deste livro?')) {
            try {
                await axios.put(`${apiURL}/emprestimos/${id}`);
                alert('Livro devolvido com sucesso!');
                // Recarrega esta lista e avisa o pai para atualizar livros/leitores
                fetchEmprestimos();
                onDevolucao();
            } catch (error) {
                console.error('Erro na devolução:', error);
                alert('Erro ao registrar devolução.');
            }
        }
    };

    return (
        <Container className="mt-4">
            <h4>Empréstimos Ativos</h4>
            {emprestimos.length === 0 ? (
                <p className="text-muted">Nenhum livro emprestado no momento.</p>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Livro</th>
                            <th>Leitor</th>
                            <th>Data Empréstimo</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emprestimos.map((emp) => (
                            <tr key={emp._id}>
                                <td>{emp.nomeLivro}</td>
                                <td>{emp.nomeLeitor}</td>
                                <td>{new Date(emp.dataEmprestimo).toLocaleDateString()}</td>
                                <td>
                                    <Badge bg="warning" text="dark">Emprestado</Badge>
                                </td>
                                <td>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleDevolucao(emp._id)}
                                    >
                                        Devolver (US07)
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default ListaEmprestimos;
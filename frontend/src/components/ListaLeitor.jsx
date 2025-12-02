import React from 'react';
import { Table, Container, Button } from 'react-bootstrap';
import axios from 'axios';

// Recebe 'leitores' e 'fetchLeitor' do App.jsx
function ListaLeitor({ leitores, fetchLeitor }) {

    // Função para US14: Excluir leitor
    const handleDelete = async (id) => {
        try {
            if (window.confirm('Tem certeza que deseja excluir este leitor?')) {
                await axios.delete(`http://localhost:3001/leitores/${id}`);
                alert('Leitor excluído com sucesso!');
                fetchLeitor(); // Recarrega a lista
            }
        } catch (error) {
            console.error('Erro ao excluir leitor:', error);
            alert('Erro ao excluir leitor.');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Lista de Leitores</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Contato</th>
                        <th>Ações</th> {/* Para US13 e US14 */}
                    </tr>
                </thead>
                <tbody>
                    {leitores.map((leitor) => (
                        <tr key={leitor._id}>
                            <td>{leitor.nome}</td>
                            <td>{leitor.contato}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(leitor._id)} // US14
                                >
                                    Excluir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default ListaLeitor;
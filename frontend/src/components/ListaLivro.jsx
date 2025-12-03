import { Table, Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { apiURL } from '../config/environment';

function ListaLivro({ livros, fetchLivro }) {

    const handleDelete = async (id) => {
        try {
            if (window.confirm('Tem certeza que deseja excluir este livro?')) {
                await axios.delete(`${apiURL}/livros/${id}`);
                alert('Livro excluído com sucesso!');

                fetchLivro();
            }
        } catch (error) {
            console.error('Erro ao excluir livro:', error);
            alert('Erro ao excluir livro.');
        }
    };

    return (
        <Container className="mt-5">
            <h2>US04: Lista de Livros no Acervo</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Ano</th>
                        <th>Categoria</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {livros.map((livro) => (
                        <tr key={livro._id}>
                            <td>{livro.titulo}</td>
                            <td>{livro.autor}</td>
                            <td>{livro.ano}</td>
                            <td>{livro.categoria}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    data-testid="button-delete-livro"
                                    size="sm"
                                    onClick={() => handleDelete(livro._id)}
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

export default ListaLivro;
import { Table, Button, Badge } from 'react-bootstrap';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ListaLivro({ livros, fetchLivro }) {
    const handleDelete = async (id) => {
        if (window.confirm('🗑️ Tem certeza que deseja excluir este livro?')) {
            try {
                await axios.delete(`${apiURL}/livros/${id}`);
                alert('✅ Livro excluído com sucesso!');
                fetchLivro();
            } catch (error) {
                console.error(error);
                alert('❌ Erro ao excluir livro.');
            }
        }
    };

    if (livros.length === 0) {
        return (
            <>
                <div className="section-title">
                    <span className="section-icon">📚</span>
                    <h5>Acervo de Livros</h5>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p className="empty-state-text">Nenhum livro cadastrado</p>
                    <p className="empty-state-subtext">Comece cadastrando seu primeiro livro!</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="section-title">
                <span className="section-icon">📚</span>
                <h5>Acervo de Livros</h5>
                <Badge bg="secondary" className="ms-auto">{livros.length} livros</Badge>
            </div>
            <div className="table-responsive">
                <Table hover>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Ano</th>
                            <th>Categoria</th>
                            <th>Status</th>
                            <th className="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {livros.map((livro) => (
                            <tr key={livro._id}>
                                <td><strong>{livro.titulo}</strong></td>
                                <td>{livro.autor}</td>
                                <td>{livro.ano}</td>
                                <td>
                                    <Badge bg="light" text="dark">{livro.categoria}</Badge>
                                </td>
                                <td>
                                    {livro.disponivel === false ? (
                                        <Badge className="badge-emprestado">📤 Emprestado</Badge>
                                    ) : (
                                        <Badge className="badge-disponivel">✅ Disponível</Badge>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(livro._id)}
                                            disabled={livro.disponivel === false}
                                            title={livro.disponivel === false ? 'Não é possível excluir livro emprestado' : 'Excluir livro'}
                                        >
                                            🗑️ Excluir
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
}

export default ListaLivro;
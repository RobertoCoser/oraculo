import { Table, Button, Badge } from 'react-bootstrap';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ListaLeitor({ leitores, fetchLeitor }) {
    const handleDelete = async (id) => {
        if (window.confirm('🗑️ Tem certeza que deseja excluir este leitor?')) {
            try {
                await axios.delete(`${apiURL}/leitores/${id}`);
                alert('✅ Leitor excluído com sucesso!');
                fetchLeitor();
            } catch (error) {
                console.error(error);
                if (error.response?.data?.message) {
                    alert(`❌ ${error.response.data.message}`);
                } else {
                    alert('❌ Erro ao excluir leitor.');
                }
            }
        }
    };

    // Função para formatar o contato com ícone
    const formatarContato = (contato) => {
        if (!contato) return <span className="text-muted">Não informado</span>;
        
        if (contato.includes('@')) {
            return <span>📧 {contato}</span>;
        }
        return <span>📱 {contato}</span>;
    };

    if (!leitores || leitores.length === 0) {
        return (
            <>
                <div className="section-title">
                    <span className="section-icon">👥</span>
                    <h5>Lista de Leitores</h5>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    <p className="empty-state-text">Nenhum leitor cadastrado</p>
                    <p className="empty-state-subtext">Cadastre leitores para realizar empréstimos!</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="section-title">
                <span className="section-icon">👥</span>
                <h5>Lista de Leitores</h5>
                <Badge bg="secondary" className="ms-auto">{leitores.length} leitores</Badge>
            </div>
            <div className="table-responsive">
                <Table hover>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Contato</th>
                            <th className="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leitores.map((leitor) => (
                            <tr key={leitor._id}>
                                <td><strong>{leitor.nome || 'Sem nome'}</strong></td>
                                <td>{formatarContato(leitor.contato)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(leitor._id)}
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

export default ListaLeitor;
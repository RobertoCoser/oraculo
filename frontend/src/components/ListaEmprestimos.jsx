import { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ListaEmprestimos({ onDevolucao, recarregar }) {
    const [emprestimos, setEmprestimos] = useState([]);
    const [loading, setLoading] = useState(false);

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
        if (window.confirm('📥 Confirmar a devolução deste livro?')) {
            setLoading(true);
            try {
                await axios.put(`${apiURL}/emprestimos/${id}`);
                alert('✅ Livro devolvido com sucesso!');
                fetchEmprestimos();
                if (onDevolucao) onDevolucao();
            } catch (error) {
                console.error('Erro ao registrar devolução:', error);
                alert('❌ Erro ao registrar devolução.');
            } finally {
                setLoading(false);
            }
        }
    };

    const calcularDiasEmprestado = (dataEmprestimo) => {
        const hoje = new Date();
        const dataEmp = new Date(dataEmprestimo);
        const diffTime = Math.abs(hoje - dataEmp);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (emprestimos.length === 0) {
        return (
            <>
                <div className="section-title">
                    <span className="section-icon">📋</span>
                    <h5>Empréstimos Ativos</h5>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p className="empty-state-text">Nenhum livro emprestado no momento</p>
                    <p className="empty-state-subtext">Todos os livros estão disponíveis!</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="section-title">
                <span className="section-icon">📋</span>
                <h5>Empréstimos Ativos</h5>
                <Badge bg="warning" text="dark" className="ms-auto">
                    {emprestimos.length} {emprestimos.length === 1 ? 'empréstimo' : 'empréstimos'}
                </Badge>
            </div>
            <div className="table-responsive">
                <Table hover>
                    <thead>
                        <tr>
                            <th>Livro</th>
                            <th>Leitor</th>
                            <th>Data Empréstimo</th>
                            <th>Dias</th>
                            <th>Status</th>
                            <th className="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emprestimos.map((emp) => {
                            const dias = calcularDiasEmprestado(emp.dataEmprestimo);
                            return (
                                <tr key={emp._id}>
                                    <td><strong>{emp.nomeLivro}</strong></td>
                                    <td>{emp.nomeLeitor}</td>
                                    <td>{new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <Badge bg={dias > 14 ? 'danger' : dias > 7 ? 'warning' : 'success'}>
                                            {dias} {dias === 1 ? 'dia' : 'dias'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge className="badge-ativo">📤 Emprestado</Badge>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => handleDevolucao(emp._id)}
                                                disabled={loading}
                                            >
                                                📥 Devolver
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        </>
    );
}

export default ListaEmprestimos;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import FormularioLivro from './components/FormularioLivro.jsx';
import ListaLivro from './components/ListaLivro.jsx';
import FormularioLeitor from './components/FormularioLeitor.jsx';
import ListaLeitor from './components/ListaLeitor.jsx';
import FormularioEmprestimo from './components/FormularioEmprestimo.jsx';
import ListaEmprestimos from './components/ListaEmprestimos.jsx';

function App() {
  const [livros, setLivros] = useState([]);
  const [leitores, setLeitores] = useState([]);
  // Estado "gatilho" para forçar recarregamento de componentes filhos
  const [atualizarDados, setAtualizarDados] = useState(0);

  const fetchLivro = async () => {
    try {
      const response = await axios.get('http://localhost:3001/livros');
      setLivros(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchLeitor = async () => {
    try {
      const response = await axios.get('http://localhost:3001/leitores');
      setLeitores(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchLivro();
    fetchLeitor();
  }, [atualizarDados]); // Recarrega sempre que 'atualizarDados' mudar

  const recarregarTudo = () => {
    setAtualizarDados(prev => prev + 1); // Muda o número para disparar o useEffect
  };

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Oráculo - Biblioteca</h1>

      {/* SEÇÃO DE EMPRÉSTIMO (US06 & US07) */}
      <div className="bg-light p-3 rounded mb-5 border">
        <FormularioEmprestimo
          livros={livros}
          leitores={leitores}
          onEmprestimoRealizado={recarregarTudo}
        />
        <ListaEmprestimos
          recarregar={atualizarDados}
          onDevolucao={recarregarTudo}
        />
      </div>

      <hr />

      <Row>
        <Col md={6} className="border-end">
          <h4 className="text-primary">Gestão de Livros</h4>
          <FormularioLivro onLivroCadastrado={recarregarTudo} />
          <div className="mt-3">
            <ListaLivro livros={livros} fetchLivro={fetchLivro} />
          </div>
        </Col>

        <Col md={6}>
          <h4 className="text-success">Gestão de Leitores</h4>
          <FormularioLeitor onLeitorSalvo={recarregarTudo} />
          <div className="mt-3">
            <ListaLeitor leitores={leitores} fetchLeitor={fetchLeitor} />
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default App
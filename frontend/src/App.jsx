import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Navbar, Nav, Tab, Tabs, Badge } from 'react-bootstrap';
import FormularioLivro from './components/FormularioLivro.jsx';
import ListaLivro from './components/ListaLivro.jsx';
import FormularioLeitor from './components/FormularioLeitor.jsx';
import ListaLeitor from './components/ListaLeitor.jsx';
import FormularioEmprestimo from './components/FormularioEmprestimo.jsx';
import ListaEmprestimos from './components/ListaEmprestimos.jsx';
import './App.css';

function App() {
  const [livros, setLivros] = useState([]);
  const [leitores, setLeitores] = useState([]);
  const [atualizarDados, setAtualizarDados] = useState(0);
  const [activeTab, setActiveTab] = useState('emprestimos');

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchLivro = async () => {
    try {
      const response = await axios.get(`${apiURL}/livros`);
      setLivros(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchLeitor = async () => {
    try {
      const response = await axios.get(`${apiURL}/leitores`);
      setLeitores(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchLivro();
    fetchLeitor();
  }, [atualizarDados]);

  const recarregarTudo = () => {
    setAtualizarDados(prev => prev + 1);
  };

  const livrosDisponiveis = livros.filter(l => l.disponivel !== false).length;
  const livrosEmprestados = livros.filter(l => l.disponivel === false).length;

  return (
    <div className="app-wrapper">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm mb-4">
        <Container fluid className="px-4">
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <span className="brand-icon">📚</span>
            <span className="brand-text">Oráculo</span>
            <Badge bg="warning" text="dark" className="ms-2">Biblioteca</Badge>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="stats-nav">
              <Nav.Item className="stat-item">
                <span className="stat-label">Livros</span>
                <span className="stat-value">{livros.length}</span>
              </Nav.Item>
              <Nav.Item className="stat-item">
                <span className="stat-label">Disponíveis</span>
                <span className="stat-value text-success">{livrosDisponiveis}</span>
              </Nav.Item>
              <Nav.Item className="stat-item">
                <span className="stat-label">Emprestados</span>
                <span className="stat-value text-warning">{livrosEmprestados}</span>
              </Nav.Item>
              <Nav.Item className="stat-item">
                <span className="stat-label">Leitores</span>
                <span className="stat-value text-info">{leitores.length}</span>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="main-container px-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 custom-tabs"
          fill
        >
          {/* Aba de Empréstimos */}
          <Tab 
            eventKey="emprestimos" 
            title={
              <span className="tab-title">
                <span className="tab-icon">🔄</span>
                Empréstimos e Devoluções
              </span>
            }
          >
            <div className="tab-content-wrapper">
              <Row>
                <Col lg={5}>
                  <div className="card-section">
                    <FormularioEmprestimo
                      livros={livros}
                      leitores={leitores}
                      onEmprestimoRealizado={recarregarTudo}
                    />
                  </div>
                </Col>
                <Col lg={7}>
                  <div className="card-section">
                    <ListaEmprestimos
                      recarregar={atualizarDados}
                      onDevolucao={recarregarTudo}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Tab>

          {/* Aba de Livros */}
          <Tab 
            eventKey="livros" 
            title={
              <span className="tab-title">
                <span className="tab-icon">📖</span>
                Gestão de Livros
                <Badge bg="primary" className="ms-2">{livros.length}</Badge>
              </span>
            }
          >
            <div className="tab-content-wrapper">
              <Row>
                <Col lg={4}>
                  <div className="card-section sticky-form">
                    <FormularioLivro onLivroCadastrado={recarregarTudo} />
                  </div>
                </Col>
                <Col lg={8}>
                  <div className="card-section">
                    <ListaLivro livros={livros} fetchLivro={fetchLivro} />
                  </div>
                </Col>
              </Row>
            </div>
          </Tab>

          {/* Aba de Leitores */}
          <Tab 
            eventKey="leitores" 
            title={
              <span className="tab-title">
                <span className="tab-icon">👥</span>
                Gestão de Leitores
                <Badge bg="success" className="ms-2">{leitores.length}</Badge>
              </span>
            }
          >
            <div className="tab-content-wrapper">
              <Row>
                <Col lg={4}>
                  <div className="card-section sticky-form">
                    <FormularioLeitor onLeitorSalvo={recarregarTudo} />
                  </div>
                </Col>
                <Col lg={8}>
                  <div className="card-section">
                    <ListaLeitor leitores={leitores} fetchLeitor={fetchLeitor} />
                  </div>
                </Col>
              </Row>
            </div>
          </Tab>
        </Tabs>
      </Container>

      {/* Footer */}
      <footer className="app-footer">
        <Container fluid>
          <p className="mb-0">
            📚 Oráculo - Sistema de Gestão de Biblioteca | 
            Desenvolvido com ❤️ para a atividade "Scrum na Prática"
          </p>
        </Container>
      </footer>
    </div>
  )
}

export default App
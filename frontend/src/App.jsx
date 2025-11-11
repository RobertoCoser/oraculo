import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import FormularioLivro from './components/FormularioLivro.jsx';
import ListaLivro from './components/ListaLivro.jsx';

function App() {
  const [livros, setLivros] = useState([]);

  const fetchLivro = async () => {
    try {
      const response = await axios.get('http://localhost:3001/livros');
      setLivros(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
  };

  useEffect(() => {
    fetchLivro();
  }, []);

  return (
    <Container>
      <FormularioLivro onLivroCadastrado={fetchLivro} />
      <hr />
      <ListaLivro livros={livros} fetchLivro={fetchLivro} />
    </Container>
  )
}

export default App
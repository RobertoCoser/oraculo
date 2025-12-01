import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

// === Configuração do MongoDB ===
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'oraculo';
const client = new MongoClient(mongoURL);

// Variável para armazenar a conexão com o banco
let db;

// Função para conectar ao banco de dados
async function connectToMongo() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB com sucesso!');
        db = client.db(dbName);
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// === Configuração do Express ===
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// === Rotas (Endpoints) ===

// Rota para US01: Cadastrar novo livro
app.post('/livros', async (req, res) => {
    try {
        const dadosDoLivro = req.body;
        dadosDoLivro.disponivel = true;
        const collection = db.collection('livros');
        const result = await collection.insertOne(dadosDoLivro);

        console.log('Livro inserido com ID:', result.insertedId);

        res.status(201).json({
            message: 'Livro cadastrado com sucesso!',
            insertedId: result.insertedId
        });

    } catch (error) {
        console.error('Erro ao inserir livro no Mongo:', error);
        res.status(500).json({ message: 'Erro interno ao salvar no banco de dados' });
    }
});

// Rota para US04: Listar todos os livros
app.get('/livros', async (req, res) => {
    try {
        const collection = db.collection('livros');

        // Encontra todos os documentos e os converte para um array
        const livros = await collection.find({}).toArray();

        res.status(200).json(livros);

    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ message: 'Erro interno ao buscar livros' });
    }
});

// Rota para US03: Excluir um livro
app.delete('/livros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const collection = db.collection('livros');

        // Converte o ID da string da URL para um ObjectId do MongoDB
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            // Se não deletou nada, é porque o ID não foi encontrado
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        res.status(200).json({ message: 'Livro excluído com sucesso' });

    } catch (error) {
        console.error('Erro ao excluir livro:', error);
        res.status(500).json({ message: 'Erro interno ao excluir livro' });
    }
});

// Rota para US06: Registrar Empréstimo
app.post('/emprestimos', async (req, res) => {
    try {
        const { idLivro, idLeitor } = req.body;

        const livrosCollection = db.collection('livros');
        const leitoresCollection = db.collection('leitores');
        const emprestimosCollection = db.collection('emprestimos');

        // 1. Verifica se o livro existe e está disponível
        const livro = await livrosCollection.findOne({ _id: new ObjectId(idLivro) });
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        if (livro.disponivel === false) return res.status(400).json({ message: 'Livro já está emprestado!' });

        // 2. Verifica se o leitor existe
        const leitor = await leitoresCollection.findOne({ _id: new ObjectId(idLeitor) });
        if (!leitor) return res.status(404).json({ message: 'Leitor não encontrado' });

        // 3. Cria o objeto de empréstimo
        const novoEmprestimo = {
            idLivro: new ObjectId(idLivro),
            idLeitor: new ObjectId(idLeitor),
            nomeLivro: livro.titulo,
            nomeLeitor: leitor.nome,
            dataEmprestimo: new Date(),
            status: 'ativo' // Para saber que ainda não foi devolvido
        };

        // 4. Salva o empréstimo
        await emprestimosCollection.insertOne(novoEmprestimo);

        // 5. ATUALIZA O LIVRO: Define disponivel = false
        await livrosCollection.updateOne(
            { _id: new ObjectId(idLivro) },
            { $set: { disponivel: false } }
        );

        res.status(201).json({ message: 'Empréstimo registrado com sucesso!' });

    } catch (error) {
        console.error('Erro ao registrar empréstimo:', error);
        res.status(500).json({ message: 'Erro interno ao registrar empréstimo' });
    }
});

// Rota para listar empréstimos (para conferência)
app.get('/emprestimos', async (req, res) => {
    try {
        const collection = db.collection('emprestimos');
        // Traz apenas os ativos, se quiser todos, remova o filtro do find
        const emprestimos = await collection.find({ status: 'ativo' }).toArray();
        res.status(200).json(emprestimos);
    } catch (error) {
        console.error('Erro ao buscar empréstimos:', error);
        res.status(500).json({ message: 'Erro interno' });
    }
});

// Rota para US07: Registrar Devolução
app.put('/emprestimos/:id', async (req, res) => {
    try {
        const { id } = req.params; // ID do Empréstimo
        const emprestimosCollection = db.collection('emprestimos');
        const livrosCollection = db.collection('livros');

        // 1. Busca o empréstimo para saber qual livro liberar
        const emprestimo = await emprestimosCollection.findOne({ _id: new ObjectId(id) });

        if (!emprestimo) {
            return res.status(404).json({ message: 'Empréstimo não encontrado' });
        }

        // 2. Atualiza o status do empréstimo para 'finalizado' e adiciona data de devolução
        await emprestimosCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: 'finalizado', dataDevolucao: new Date() } }
        );

        // 3. ATUALIZA O LIVRO: Define disponivel = true (Libera o livro)
        await livrosCollection.updateOne(
            { _id: new ObjectId(emprestimo.idLivro) },
            { $set: { disponivel: true } }
        );

        res.status(200).json({ message: 'Devolução registrada com sucesso!' });

    } catch (error) {
        console.error('Erro ao devolver:', error);
        res.status(500).json({ message: 'Erro interno na devolução' });
    }
});

// === Iniciar o Servidor ===
connectToMongo().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor backend rodando em http://localhost:${PORT}`);
    });
});
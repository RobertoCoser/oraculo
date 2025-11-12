import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';

// === Configuração do MongoDB ===
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'oraculo';
const client = new MongoClient(mongoURL);

const ALT_PORT = 3001;

// Variável para armazenar a conexão com o banco
let db;

// Função para conectar ao banco de dados
export async function connectToMongo() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB com sucesso!');
        db = client.db(dbName);
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// Função para encerrar conexão
export async function closeConnection() {
    if (client) {
        await client.close();
        console.log('Conexão com MongoDB fechada');
    }
}

// Função para obter o banco de dados
export function getDb() {
    return db;
}

// === Configuração do Express ===
export function createApp() {
    const app = express();
    
    app.use(cors());
    app.use(express.json());

    // === Rotas (Endpoints) ===

    // Rota para US01: Cadastrar novo livro
    app.post('/livros', async (req, res) => {
        try {
            const dadosDoLivro = req.body;

            // Validação básica
            if (!dadosDoLivro.titulo || !dadosDoLivro.autor) {
                return res.status(400).json({ message: 'Título e autor são obrigatórios' });
            }

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

            // Validação do ObjectId
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }

            const collection = db.collection('livros');
            const result = await collection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Livro não encontrado' });
            }

            res.status(200).json({ message: 'Livro excluído com sucesso' });

        } catch (error) {
            console.error('Erro ao excluir livro:', error);
            res.status(500).json({ message: 'Erro interno ao excluir livro' });
        }
    });
    return app;
}

// === Iniciar o Servidor (apenas se não estiver em modo de teste) ===
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || ALT_PORT;
    
    connectToMongo().then(() => {
        const app = createApp();
        app.listen(PORT, () => {
            console.log(`Servidor backend rodando em http://localhost:${PORT}`);
        });
    }).catch((error) => {
        console.error('Falha ao iniciar o servidor:', error);
        process.exit(1);
    });
}
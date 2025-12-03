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
    })

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
    })

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
    // Rota para US06: Registrar Empréstimo
    app.post('/emprestimos', async (req, res) => {
        try {
            const { idLivro, idLeitor } = req.body;

            if (!idLivro || !idLeitor) {
                return res.status(400).json({ message: 'idLivro e idLeitor são obrigatórios' });
            }

            if (!ObjectId.isValid(idLivro) || !ObjectId.isValid(idLeitor)) {
                return res.status(400).json({ message: 'IDs inválidos' });
            }

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
            const result = await emprestimosCollection.insertOne(novoEmprestimo);

            // 5. ATUALIZA O LIVRO: Define disponivel = false
            await livrosCollection.updateOne(
                { _id: new ObjectId(idLivro) },
                { $set: { disponivel: false } }
            );

            res.status(201).json({ 
                message: 'Empréstimo registrado com sucesso!',
                insertedId: result.insertedId
            });

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

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }

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
     // ============================================
    // ROTAS DE LEITORES
    // ============================================

    // Rota para US12: Cadastrar novo leitor
    app.post('/leitores', async (req, res) => {
        try {
            const { nome, contato } = req.body;

            // Validação básica
            if (!nome || !contato) {
                return res.status(400).json({ message: 'Nome e contato são obrigatórios' });
            }

            const collection = db.collection('leitores');
            const novoLeitor = { nome, contato };
            const result = await collection.insertOne(novoLeitor);

            console.log('Leitor inserido com ID:', result.insertedId);

            res.status(201).json({
                message: 'Leitor cadastrado com sucesso!',
                insertedId: result.insertedId
            });

        } catch (error) {
            console.error('Erro ao inserir leitor no Mongo:', error);
            res.status(500).json({ message: 'Erro interno ao salvar leitor' });
        }
    });

    // Rota para US13: Listar todos os leitores
    app.get('/leitores', async (req, res) => {
        try {
            const collection = db.collection('leitores');
            const leitores = await collection.find({}).toArray();
            res.status(200).json(leitores);
        } catch (error) {
            console.error('Erro ao buscar leitores:', error);
            res.status(500).json({ message: 'Erro interno ao buscar leitores' });
        }
    });

    // Rota para buscar um leitor por ID
    app.get('/leitores/:id', async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }

            const collection = db.collection('leitores');
            const leitor = await collection.findOne({ _id: new ObjectId(id) });

            if (!leitor) {
                return res.status(404).json({ message: 'Leitor não encontrado' });
            }

            res.status(200).json(leitor);

        } catch (error) {
            console.error('Erro ao buscar leitor:', error);
            res.status(500).json({ message: 'Erro interno ao buscar leitor' });
        }
    });

    // Rota para atualizar um leitor
    app.put('/leitores/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, contato } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }

            if (!nome && !contato) {
                return res.status(400).json({ message: 'Informe ao menos um campo para atualizar (nome ou contato)' });
            }

            const collection = db.collection('leitores');
            
            // Monta objeto de atualização apenas com campos informados
            const atualizacao = {};
            if (nome) atualizacao.nome = nome;
            if (contato) atualizacao.contato = contato;

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: atualizacao }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Leitor não encontrado' });
            }

            res.status(200).json({ message: 'Leitor atualizado com sucesso!' });

        } catch (error) {
            console.error('Erro ao atualizar leitor:', error);
            res.status(500).json({ message: 'Erro interno ao atualizar leitor' });
        }
    });

    // Rota para US14: Excluir um leitor
    app.delete('/leitores/:id', async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }

            const emprestimosCollection = db.collection('emprestimos');
            const leitoresCollection = db.collection('leitores');

            // Verifica se o leitor tem empréstimos ativos
            const emprestimoAtivo = await emprestimosCollection.findOne({
                idLeitor: new ObjectId(id),
                status: 'ativo'
            });

            if (emprestimoAtivo) {
                return res.status(400).json({ 
                    message: 'Não é possível excluir leitor com empréstimos ativos' 
                });
            }

            const result = await leitoresCollection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Leitor não encontrado' });
            }

            res.status(200).json({ message: 'Leitor excluído com sucesso' });

        } catch (error) {
            console.error('Erro ao excluir leitor:', error);
            res.status(500).json({ message: 'Erro interno ao excluir leitor' });
        }
    });
    return app;
}

// === Iniciar o Servidor (apenas se não estiver em modo dev) ===
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
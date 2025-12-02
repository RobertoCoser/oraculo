import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ObjectId } from 'mongodb';
import { connectToMongo, closeConnection, getDb } from '../../index.js';

describe('Testes Unitários - Operações no MongoDB', () => {
    let mongoServer;
    let db;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await connectToMongo(uri, 'test-oraculo');
        db = getDb();
    });

    afterAll(async () => {
        await closeConnection();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await db.collection('livros').deleteMany({});
        await db.collection('emprestimos').deleteMany({});
        await db.collection('leitores').deleteMany({});
    });

    // ============================================
    // TESTES DE LIVROS
    // ============================================
    describe('Livros - Inserção', () => {
        it('deve inserir um livro com sucesso', async () => {
            const livro = {
                titulo: 'Dom Casmurro',
                autor: 'Machado de Assis',
                ano: 1899,
                categoria: 'Romance'
            };

            const result = await db.collection('livros').insertOne(livro);
            
            expect(result.insertedId).toBeDefined();
            expect(result.acknowledged).toBe(true);

            const livroInserido = await db.collection('livros').findOne({ _id: result.insertedId });
            expect(livroInserido.titulo).toBe('Dom Casmurro');
            expect(livroInserido.autor).toBe('Machado de Assis');
        });

        it('deve inserir múltiplos livros', async () => {
            const livros = [
                { titulo: 'Livro 1', autor: 'Autor 1', ano: 2020, categoria: 'Ficção' },
                { titulo: 'Livro 2', autor: 'Autor 2', ano: 2021, categoria: 'Romance' }
            ];

            await db.collection('livros').insertMany(livros);
            const count = await db.collection('livros').countDocuments();
            
            expect(count).toBe(2);
        });
    });

    describe('Livros - Busca', () => {
        beforeEach(async () => {
            await db.collection('livros').insertMany([
                { titulo: 'Livro A', autor: 'Autor 1', ano: 2020, categoria: 'Ficção' },
                { titulo: 'Livro B', autor: 'Autor 2', ano: 2021, categoria: 'Romance' },
                { titulo: 'Livro C', autor: 'Autor 1', ano: 2022, categoria: 'Ficção' }
            ]);
        });

        it('deve listar todos os livros', async () => {
            const livros = await db.collection('livros').find({}).toArray();
            expect(livros).toHaveLength(3);
        });

        it('deve buscar livros por autor', async () => {
            const livros = await db.collection('livros').find({ autor: 'Autor 1' }).toArray();
            expect(livros).toHaveLength(2);
        });

        it('deve buscar livros por categoria', async () => {
            const livros = await db.collection('livros').find({ categoria: 'Ficção' }).toArray();
            expect(livros).toHaveLength(2);
        });
    });

    describe('Livros - Exclusão', () => {
        it('deve excluir um livro por ID', async () => {
            const result = await db.collection('livros').insertOne({
                titulo: 'Livro para deletar',
                autor: 'Autor Teste',
                ano: 2020,
                categoria: 'Teste'
            });

            const deleteResult = await db.collection('livros').deleteOne({ _id: result.insertedId });
            expect(deleteResult.deletedCount).toBe(1);

            const livro = await db.collection('livros').findOne({ _id: result.insertedId });
            expect(livro).toBeNull();
        });

        it('não deve excluir livro com ID inexistente', async () => {
            const fakeId = new ObjectId();
            const result = await db.collection('livros').deleteOne({ _id: fakeId });
            expect(result.deletedCount).toBe(0);
        });
    });

    // ============================================
    // TESTES DE EMPRÉSTIMOS (US06 e US07)
    // ============================================
    describe('Empréstimos - Registro (US06)', () => {
        let livroId;
        let leitorId;

        beforeEach(async () => {
            // Criar livro de teste
            const livroResult = await db.collection('livros').insertOne({
                titulo: 'Livro Teste',
                autor: 'Autor Teste',
                ano: 2020,
                categoria: 'Teste'
            });
            livroId = livroResult.insertedId;

            // Criar leitor de teste
            const leitorResult = await db.collection('leitores').insertOne({
                nome: 'João Silva',
                email: 'joao@email.com'
            });
            leitorId = leitorResult.insertedId;
        });

        it('deve registrar um empréstimo com sucesso', async () => {
            const emprestimo = {
                idLivro: livroId,
                idLeitor: leitorId,
                dataEmprestimo: new Date(),
                dataDevolucaoPrevista: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'ativo'
            };

            const result = await db.collection('emprestimos').insertOne(emprestimo);
            
            expect(result.insertedId).toBeDefined();
            expect(result.acknowledged).toBe(true);

            const emprestimoInserido = await db.collection('emprestimos').findOne({ _id: result.insertedId });
            expect(emprestimoInserido.status).toBe('ativo');
            expect(emprestimoInserido.idLivro).toEqual(livroId);
        });

        it('deve listar todos os empréstimos', async () => {
            await db.collection('emprestimos').insertMany([
                {
                    idLivro: livroId,
                    idLeitor: leitorId,
                    dataEmprestimo: new Date(),
                    status: 'ativo'
                },
                {
                    idLivro: livroId,
                    idLeitor: leitorId,
                    dataEmprestimo: new Date(),
                    status: 'devolvido'
                }
            ]);

            const emprestimos = await db.collection('emprestimos').find({}).toArray();
            expect(emprestimos).toHaveLength(2);
        });

        it('deve buscar empréstimos por status', async () => {
            await db.collection('emprestimos').insertMany([
                { idLivro: livroId, idLeitor: leitorId, status: 'ativo' },
                { idLivro: livroId, idLeitor: leitorId, status: 'ativo' },
                { idLivro: livroId, idLeitor: leitorId, status: 'devolvido' }
            ]);

            const ativos = await db.collection('emprestimos').find({ status: 'ativo' }).toArray();
            expect(ativos).toHaveLength(2);
        });
    });

    describe('Empréstimos - Devolução (US07)', () => {
        let emprestimoId;

        beforeEach(async () => {
            const livroResult = await db.collection('livros').insertOne({
                titulo: 'Livro Teste',
                autor: 'Autor Teste',
                ano: 2020,
                categoria: 'Teste'
            });

            const leitorResult = await db.collection('leitores').insertOne({
                nome: 'Maria Santos',
                email: 'maria@email.com'
            });

            const emprestimoResult = await db.collection('emprestimos').insertOne({
                idLivro: livroResult.insertedId,
                idLeitor: leitorResult.insertedId,
                dataEmprestimo: new Date(),
                status: 'ativo'
            });
            emprestimoId = emprestimoResult.insertedId;
        });

        it('deve registrar devolução com sucesso', async () => {
            const dataDevolucao = new Date();
            
            const result = await db.collection('emprestimos').updateOne(
                { _id: emprestimoId },
                { 
                    $set: { 
                        status: 'devolvido',
                        dataDevolucao: dataDevolucao
                    }
                }
            );

            expect(result.modifiedCount).toBe(1);

            const emprestimoAtualizado = await db.collection('emprestimos').findOne({ _id: emprestimoId });
            expect(emprestimoAtualizado.status).toBe('devolvido');
            expect(emprestimoAtualizado.dataDevolucao).toEqual(dataDevolucao);
        });

        it('não deve atualizar empréstimo inexistente', async () => {
            const fakeId = new ObjectId();
            
            const result = await db.collection('emprestimos').updateOne(
                { _id: fakeId },
                { $set: { status: 'devolvido' } }
            );

            expect(result.modifiedCount).toBe(0);
        });

        it('deve buscar empréstimo por ID', async () => {
            const emprestimo = await db.collection('emprestimos').findOne({ _id: emprestimoId });
            
            expect(emprestimo).not.toBeNull();
            expect(emprestimo._id).toEqual(emprestimoId);
        });
    });
});
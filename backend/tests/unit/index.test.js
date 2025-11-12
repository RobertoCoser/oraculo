import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';
import { connectToMongo, closeConnection } from '../../index.js';
import { getDb } from '../../index.js';

describe('Testes Unitários - Operações no MongoDB', () => {
    let mongoServer;
    let db;

    beforeAll(async () => {
        // Inicia um servidor MongoDB em memória
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
        // Limpa a coleção antes de cada teste
        await db.collection('livros').deleteMany({});
    });

    describe('Inserção de livros', () => {
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

    describe('Busca de livros', () => {
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

    describe('Exclusão de livros', () => {
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
});
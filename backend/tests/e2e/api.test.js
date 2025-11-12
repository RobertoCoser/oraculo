import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { closeConnection, connectToMongo, createApp, getDb } from '../../index.js';

describe('Testes E2E - API de Livros', () => {
    let app;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await connectToMongo(uri, 'test-oraculo-e2e');
        app = createApp();
    });

    afterAll(async () => {
        await closeConnection();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        const db = getDb();
        await db.collection('livros').deleteMany({});
    });

    describe('POST /livros - US01: Cadastrar novo livro', () => {
        it('deve cadastrar um livro com sucesso', async () => {
            const novoLivro = {
                titulo: 'Clean Code',
                autor: 'Robert C. Martin',
                ano: 2008,
                categoria: 'Programação'
            };

            const response = await request(app)
                .post('/livros')
                .send(novoLivro)
                .expect(201);

            expect(response.body.message).toBe('Livro cadastrado com sucesso!');
            expect(response.body.insertedId).toBeDefined();
        });

        it('deve retornar erro 400 se título não for fornecido', async () => {
            const livroInvalido = {
                autor: 'Autor Teste',
                ano: 2020,
                categoria: 'Teste'
            };

            const response = await request(app)
                .post('/livros')
                .send(livroInvalido)
                .expect(400);

            expect(response.body.message).toBe('Título e autor são obrigatórios');
        });

        it('deve retornar erro 400 se autor não for fornecido', async () => {
            const livroInvalido = {
                titulo: 'Livro Teste',
                ano: 2020,
                categoria: 'Teste'
            };

            const response = await request(app)
                .post('/livros')
                .send(livroInvalido)
                .expect(400);

            expect(response.body.message).toBe('Título e autor são obrigatórios');
        });
    });

    describe('GET /livros - US04: Listar todos os livros', () => {
        it('deve retornar lista vazia quando não há livros', async () => {
            const response = await request(app)
                .get('/livros')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('deve listar todos os livros cadastrados', async () => {
            await request(app).post('/livros').send({
                titulo: 'Livro 1',
                autor: 'Autor 1',
                ano: 2020,
                categoria: 'Ficção'
            });

            await request(app).post('/livros').send({
                titulo: 'Livro 2',
                autor: 'Autor 2',
                ano: 2021,
                categoria: 'Romance'
            });

            const response = await request(app)
                .get('/livros')
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('titulo');
            expect(response.body[0]).toHaveProperty('autor');
            expect(response.body[0]).toHaveProperty('_id');
        });
    });

    describe('DELETE /livros/:id - US03: Excluir um livro', () => {
        it('deve excluir um livro existente', async () => {
            const cadastroResponse = await request(app)
                .post('/livros')
                .send({
                    titulo: 'Livro para deletar',
                    autor: 'Autor Teste',
                    ano: 2020,
                    categoria: 'Teste'
                });

            const livroId = cadastroResponse.body.insertedId;

            const deleteResponse = await request(app)
                .delete(`/livros/${livroId}`)
                .expect(200);

            expect(deleteResponse.body.message).toBe('Livro excluído com sucesso');

            const listResponse = await request(app).get('/livros');
            expect(listResponse.body).toHaveLength(0);
        });

        it('deve retornar erro 404 para ID inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/livros/${fakeId}`)
                .expect(404);

            expect(response.body.message).toBe('Livro não encontrado');
        });

        it('deve retornar erro 400 para ID inválido', async () => {
            const invalidId = 'id-invalido-123';

            const response = await request(app)
                .delete(`/livros/${invalidId}`)
                .expect(400);

            expect(response.body.message).toBe('ID inválido');
        });
    });

    describe('Fluxo completo E2E - CRUD', () => {
        it('deve executar operações completas: criar, listar e deletar', async () => {
            // 1. Criar livros
            const livro1 = await request(app)
                .post('/livros')
                .send({
                    titulo: 'O Senhor dos Anéis',
                    autor: 'J.R.R. Tolkien',
                    ano: 1954,
                    categoria: 'Fantasia'
                })
                .expect(201);

            const livro2 = await request(app)
                .post('/livros')
                .send({
                    titulo: '1984',
                    autor: 'George Orwell',
                    ano: 1949,
                    categoria: 'Distopia'
                })
                .expect(201);

            // 2. Listar e verificar que existem 2 livros
            const listaResponse = await request(app)
                .get('/livros')
                .expect(200);

            expect(listaResponse.body).toHaveLength(2);

            // 3. Deletar um livro
            await request(app)
                .delete(`/livros/${livro1.body.insertedId}`)
                .expect(200);

            // 4. Verificar que resta apenas 1 livro
            const listaFinal = await request(app)
                .get('/livros')
                .expect(200);

            expect(listaFinal.body).toHaveLength(1);
            expect(listaFinal.body[0].titulo).toBe('1984');
        });
    });
});
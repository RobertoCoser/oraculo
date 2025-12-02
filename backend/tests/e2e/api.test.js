import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { closeConnection, connectToMongo, createApp, getDb } from '../../index.js';

describe('Testes E2E - API Oráculo', () => {
    let app;
    let mongoServer;
    let db;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await connectToMongo(uri, 'test-oraculo-e2e');
        db = getDb();
        app = createApp();
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

    // ============================================
    // TESTES DE EMPRÉSTIMOS
    // ============================================
    describe('POST /emprestimos - US06: Registrar Empréstimo', () => {
        let livroId;
        let leitorId;

        beforeEach(async () => {
            // Criar livro de teste
            const livroResponse = await request(app)
                .post('/livros')
                .send({
                    titulo: 'Livro para Empréstimo',
                    autor: 'Autor Teste',
                    ano: 2020,
                    categoria: 'Teste'
                });
            livroId = livroResponse.body.insertedId;

            // Criar leitor diretamente no banco
            const leitorResult = await db.collection('leitores').insertOne({
                nome: 'João Silva',
                email: 'joao@email.com'
            });
            leitorId = leitorResult.insertedId.toString();
        });

        it('deve registrar um empréstimo com sucesso', async () => {
            const emprestimo = {
                idLivro: livroId,
                idLeitor: leitorId
            };

            const response = await request(app)
                .post('/emprestimos')
                .send(emprestimo)
                .expect(201);

            expect(response.body.message).toBe('Empréstimo registrado com sucesso!');
            expect(response.body.insertedId).toBeDefined();
        });

        it('deve retornar erro 400 se idLivro não for fornecido', async () => {
            const emprestimoInvalido = {
                idLeitor: leitorId
            };

            const response = await request(app)
                .post('/emprestimos')
                .send(emprestimoInvalido)
                .expect(400);

            expect(response.body.message).toBe('idLivro e idLeitor são obrigatórios');
        });

        it('deve retornar erro 400 se idLeitor não for fornecido', async () => {
            const emprestimoInvalido = {
                idLivro: livroId
            };

            const response = await request(app)
                .post('/emprestimos')
                .send(emprestimoInvalido)
                .expect(400);

            expect(response.body.message).toBe('idLivro e idLeitor são obrigatórios');
        });

        it('deve retornar erro 404 se livro não existir', async () => {
            const emprestimoInvalido = {
                idLivro: '507f1f77bcf86cd799439011',
                idLeitor: leitorId
            };

            const response = await request(app)
                .post('/emprestimos')
                .send(emprestimoInvalido)
                .expect(404);

            expect(response.body.message).toBe('Livro não encontrado');
        });
    });

    describe('GET /emprestimos - Listar Empréstimos', () => {
        it('deve retornar lista vazia quando não há empréstimos', async () => {
            const response = await request(app)
                .get('/emprestimos')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('deve listar todos os empréstimos cadastrados', async () => {
            // Criar livro e leitor
            const livroResponse = await request(app)
                .post('/livros')
                .send({
                    titulo: 'Livro Teste',
                    autor: 'Autor Teste',
                    ano: 2020,
                    categoria: 'Teste'
                });

            const leitorResult = await db.collection('leitores').insertOne({
                nome: 'Maria Santos',
                email: 'maria@email.com'
            });

            // Registrar empréstimo
            await request(app)
                .post('/emprestimos')
                .send({
                    idLivro: livroResponse.body.insertedId,
                    idLeitor: leitorResult.insertedId.toString()
                });

            const response = await request(app)
                .get('/emprestimos')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toHaveProperty('idLivro');
            expect(response.body[0]).toHaveProperty('idLeitor');
            expect(response.body[0]).toHaveProperty('status');
        });
    });

    describe('PUT /emprestimos/:id - US07: Registrar Devolução', () => {
        let emprestimoId;

        beforeEach(async () => {
            // Criar livro
            const livroResponse = await request(app)
                .post('/livros')
                .send({
                    titulo: 'Livro para Devolução',
                    autor: 'Autor Teste',
                    ano: 2020,
                    categoria: 'Teste'
                });

            // Criar leitor
            const leitorResult = await db.collection('leitores').insertOne({
                nome: 'Pedro Costa',
                email: 'pedro@email.com'
            });

            // Registrar empréstimo
            const emprestimoResponse = await request(app)
                .post('/emprestimos')
                .send({
                    idLivro: livroResponse.body.insertedId,
                    idLeitor: leitorResult.insertedId.toString()
                });

            // Converter para string se for ObjectId
            emprestimoId = emprestimoResponse.body.insertedId.toString ? 
                emprestimoResponse.body.insertedId.toString() : 
                emprestimoResponse.body.insertedId;
        });

        it('deve registrar devolução com sucesso', async () => {
            const response = await request(app)
                .put(`/emprestimos/${emprestimoId}`)
                .expect(200);

            expect(response.body.message).toBe('Devolução registrada com sucesso!');

            // Verificar se o empréstimo não aparece mais na lista de ativos
            const emprestimosResponse = await request(app).get('/emprestimos');
            expect(emprestimosResponse.body).toHaveLength(0);
        });

        it('deve retornar erro 404 para empréstimo inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .put(`/emprestimos/${fakeId}`)
                .expect(404);

            expect(response.body.message).toBe('Empréstimo não encontrado');
        });

        it('deve retornar erro 400 para ID inválido', async () => {
            const invalidId = 'id-invalido-123';

            const response = await request(app)
                .put(`/emprestimos/${invalidId}`)
                .expect(400);

            expect(response.body.message).toBe('ID inválido');
        });
    });

    // ============================================
    // FLUXO COMPLETO E2E
    // ============================================
    describe('Fluxo completo E2E - CRUD Livros', () => {
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

    describe('Fluxo completo E2E - Empréstimo e Devolução', () => {
        it('deve executar fluxo completo: criar livro, emprestar e devolver', async () => {
            // 1. Criar livro
            const livroResponse = await request(app)
                .post('/livros')
                .send({
                    titulo: 'Clean Code',
                    autor: 'Robert C. Martin',
                    ano: 2008,
                    categoria: 'Programação'
                })
                .expect(201);

            // 2. Criar leitor
            const leitorResult = await db.collection('leitores').insertOne({
                nome: 'Ana Paula',
                email: 'ana@email.com'
            });

            // 3. Registrar empréstimo
            const emprestimoResponse = await request(app)
                .post('/emprestimos')
                .send({
                    idLivro: livroResponse.body.insertedId,
                    idLeitor: leitorResult.insertedId.toString()
                })
                .expect(201);

            // Converter para string se for ObjectId
            const emprestimoId = emprestimoResponse.body.insertedId.toString ? 
                emprestimoResponse.body.insertedId.toString() : 
                emprestimoResponse.body.insertedId;

            // 4. Verificar empréstimo ativo
            let emprestimosResponse = await request(app)
                .get('/emprestimos')
                .expect(200);

            expect(emprestimosResponse.body).toHaveLength(1);
            expect(emprestimosResponse.body[0].status).toBe('ativo');

            // 5. Registrar devolução
            await request(app)
                .put(`/emprestimos/${emprestimoId}`)
                .expect(200);

            // 6. Verificar que não há mais empréstimos ativos (GET retorna apenas ativos)
            emprestimosResponse = await request(app)
                .get('/emprestimos')
                .expect(200);

            expect(emprestimosResponse.body).toHaveLength(0);

            // 7. Verificar diretamente no banco que o empréstimo foi finalizado
            const { ObjectId } = await import('mongodb');
            const emprestimoFinalizado = await db.collection('emprestimos').findOne({ 
                _id: new ObjectId(emprestimoId) 
            });
            expect(emprestimoFinalizado.status).toBe('finalizado');
            expect(emprestimoFinalizado.dataDevolucao).toBeDefined();
        });
    });
});
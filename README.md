# 📚 Oráculo - Sistema de Gestão de Biblioteca

Este projeto é um sistema de gerenciamento de biblioteca (CRUD de livros, leitores e empréstimos) desenvolvido para a atividade "Scrum na prática".

## 🚀 Tecnologias Utilizadas

* **Frontend:**
    * React (Vite)
    * React Bootstrap
    * Axios
* **Backend:**
    * Node.js
    * Express
    * MongoDB (com driver `mongodb`)
    * Nodemon
* **Testes:**
    * Jest (Backend)
    * Vitest + Testing Library (Frontend)
    * Supertest (E2E)
    * MongoDB Memory Server (Banco em memória)
* **Versionamento:**
    * Git & GitHub

---

## 🛠️ Pré-requisitos

Antes de começar, você precisará ter as seguintes ferramentas instaladas em sua máquina:
* [Node.js](https://nodejs.org/en/) (que inclui o `npm`)
* [Git](https://git-scm.com/)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Necessário para o banco de dados)

---

## 🏁 Rodando o Projeto

Siga estes passos para configurar e rodar o projeto localmente:

### 1. Clonar o Repositório

```bash
git clone https://github.com/RobertoCoser/oraculo.git
cd oraculo
```

### 2. Configurar e Rodar o Backend

O backend é responsável pela API e conexão com o banco de dados.

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Instale as dependências (Express, MongoDB, CORS, Nodemon)
npm install

# 3. Inicie o servidor
# (Certifique-se que o seu MongoDB Server está rodando localmente)
npm run dev
```

O servidor backend estará rodando em http://localhost:3001.

Inclua o `.env` no root de backend dir:

```text
# dev | prod
NODE_ENV=prod
MONGO_URL=mongodb://localhost:27017
DB_NAME=oraculo
PORT=3000
```

### 3. Configurar e Rodar o Frontend

O frontend é a interface visual feita em React. (Abra um novo terminal para este passo).

```bash
# 1. Navegue até a pasta do frontend (na raiz do projeto)
cd frontend

# 2. Instale as dependências (React, Bootstrap, Axios)
npm install

# 3. Inicie a aplicação
npm run dev
```

Setar variáveis de ambiente no root do frontend:

```text
VITE_API_URL=http://localhost:3000
# dev | prod
VITE_NODE_ENV=prod
```

A aplicação estará disponível em http://localhost:5173 (ou outra porta indicada pelo Vite).

---

## 🧪 Testes

O projeto possui uma cobertura completa de testes automatizados e manuais para backend e frontend.

### 📊 Visão Geral

| Camada | Tipo | Ferramenta | User Stories Cobertas |
|--------|------|------------|----------------------|
| Backend | Unitário | Jest + MongoDB Memory Server | US01, US03, US04 |
| Backend | E2E | Jest + Supertest | US01, US03, US04, US06, US07 |
| Frontend | Componentes | Vitest + Testing Library | US01, US03, US04, US06, US07, US12, US14 |
| API | Manual | Insomnia/Postman | Todos os endpoints |

---

### 🔧 Testes do Backend

#### 1. Testes Unitários

Testam funções e operações isoladas do MongoDB usando banco em memória:

```bash
cd backend
npm run test:unit
```

**O que é testado:**
- ✅ Inserção de livros no banco de dados
- ✅ Busca de livros (por autor, categoria, etc.)
- ✅ Exclusão de livros
- ✅ Validações de dados
- ✅ Operações CRUD completas

#### 2. Testes E2E (End-to-End)

Testam a API completa com requisições HTTP reais:

```bash
cd backend
npm run test:e2e
```

**O que é testado:**

| Endpoint | Método | User Story | Cenários |
|----------|--------|------------|----------|
| `/livros` | POST | US01 | Sucesso, sem título, sem autor, campos opcionais |
| `/livros` | GET | US04 | Lista vazia, múltiplos livros |
| `/livros/:id` | DELETE | US03 | Sucesso, ID inválido, ID inexistente |
| `/emprestimos` | POST | US06 | Sucesso, livro inexistente, leitor inexistente, livro já emprestado |
| `/emprestimos` | GET | - | Lista ativos, lista vazia |
| `/emprestimos/:id` | PUT | US07 | Sucesso, ID inválido, empréstimo inexistente |

**Fluxos Completos Testados:**
- ✅ CRUD de Livros (criar → listar → excluir → verificar)
- ✅ Empréstimo e Devolução (criar livro → emprestar → verificar → devolver → verificar)

#### 3. Todos os Testes + Cobertura

```bash
cd backend

# Executar todos os testes
npm test

# Executar em modo watch (re-executa ao salvar)
npm run test:watch

# Executar com relatório de cobertura
npm run test:coverage
```

#### 4. Estrutura de Testes do Backend

```
backend/tests/
├── unit/                         # Testes unitários
│   └── livros.test.js           # Testa operações no MongoDB
├── e2e/                          # Testes end-to-end
│   └── api.test.js              # Testa endpoints da API
└── manual/                       # Testes manuais
    └── insomnia-collection.yaml # Coleção para Insomnia/Postman
```

---

### ⚛️ Testes do Frontend

#### 1. Testes de Componentes

Testam componentes React de forma isolada:

```bash
cd frontend
npm test
```

**Componentes Testados:**

| Componente | User Story | Cenários Testados |
|------------|------------|-------------------|
| `FormularioLivro` | US01 | Renderização, validação, envio, erros, limpeza de campos |
| `ListaLivro` | US03, US04 | Listagem, exclusão, confirmação, tratamento de erros |
| `FormularioLeitor` | US12 | Renderização, validação, cadastro com email/telefone |
| `ListaLeitor` | US14 | Listagem, exclusão, confirmação, tratamento de erros |
| `FormularioEmprestimo` | US06 | Seleção de livro/leitor, validação, registro de empréstimo |
| `ListaEmprestimos` | US07 | Listagem, devolução, confirmação, atualização de status |

#### 2. Comandos de Teste

```bash
cd frontend

# Watch mode (re-executa ao salvar)
npm test

# Executar uma vez (CI/CD)
npm run test:run

# Interface gráfica interativa
npm run test:ui

# Cobertura de código
npm run test:coverage
```

#### 3. Estrutura de Testes do Frontend

```
frontend/src/test/
├── setup.js                          # Configuração global dos testes
├── components/                       # Testes de componentes
│   ├── FormularioLivro.test.jsx     # US01: Cadastrar livros
│   ├── ListaLivro.test.jsx          # US03, US04: Listar e excluir
│   ├── FormularioLeitor.test.jsx    # US12: Cadastrar leitores
│   ├── ListaLeitor.test.jsx         # US14: Listar e excluir leitores
│   ├── FormularioEmprestimo.test.jsx # US06: Registrar empréstimos
│   └── ListaEmprestimos.test.jsx    # US07: Registrar devoluções
└── integration/                      # Testes de integração
    └── environment.test.js          # Configuração de ambiente
```

---

### 📬 Testes Manuais (API)

Para testes exploratórios e validação manual da API:

#### Usando Insomnia

1. Importe a coleção de testes:
   ```
   Arquivo: backend/tests/manual/insomnia-collection.yaml
   ```

2. No Insomnia:
   - `Ctrl+O` (ou `Application` → `Import Data`)
   - Selecione o arquivo YAML
   - Escolha o ambiente "Development"

3. **A coleção inclui:**

| Pasta | Descrição | Quantidade |
|-------|-----------|------------|
| US01 - Cadastrar Livros | Testes de cadastro | 5 requests |
| US03 - Excluir Livros | Testes de exclusão | 3 requests |
| US04 - Listar Livros | Testes de listagem | 1 request |
| US06 - Registrar Empréstimos | Testes de empréstimo | 5 requests |
| US07 - Registrar Devoluções | Testes de devolução | 3 requests |
| Fluxo CRUD Livros | Fluxo completo | 4 requests |
| Fluxo Empréstimo/Devolução | Fluxo completo | 5 requests |
| Massa de Dados | Popular banco | 6 requests |

**Total: 32 requests organizados em 8 pastas**

#### Usando Postman

Você também pode usar o arquivo YAML no Postman:
- `Import` → Selecione `insomnia-collection.yaml`
- Configure a variável `base_url` para `http://localhost:3000`

---

### 📋 Tabela Comparativa de Testes

| Tipo | Ferramenta | Localização | Descrição | Quando Usar |
|------|------------|-------------|-----------|-------------|
| **Unitário Backend** | Jest + MongoDB Memory Server | `backend/tests/unit/` | Testa operações no MongoDB | Durante desenvolvimento do backend |
| **E2E Backend** | Jest + Supertest | `backend/tests/e2e/` | Testa API completa | Antes de commits no backend |
| **Componentes Frontend** | Vitest + Testing Library | `frontend/src/test/components/` | Testa componentes React | Durante desenvolvimento do frontend |
| **Integração Frontend** | Vitest | `frontend/src/test/integration/` | Testa configurações e integrações | Ao configurar ambiente |
| **Manual/API** | Insomnia/Postman | `backend/tests/manual/` | Testa endpoints manualmente | Validação exploratória e debug |

---

### ⚡ Comandos Rápidos

#### Backend

```bash
cd backend

npm test              # Todos os testes
npm run test:unit     # Apenas unitários
npm run test:e2e      # Apenas E2E
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
```

#### Frontend

```bash
cd frontend

npm test              # Watch mode
npm run test:run      # Uma vez (CI/CD)
npm run test:ui       # Interface gráfica
npm run test:coverage # Com cobertura
```

---

### ✅ Critérios de Qualidade

| Métrica | Meta | Status |
|---------|------|--------|
| Cobertura Backend | > 80% | ✅ |
| Cobertura Frontend | > 80% | ✅ |
| User Stories Testadas | 100% | ✅ |
| Testes E2E Passando | 100% | ✅ |
| Coleção Manual Completa | 32 requests | ✅ |

---

### 🗂️ User Stories Cobertas por Testes

| US | Descrição | Unitário | E2E | Frontend | Manual |
|----|-----------|----------|-----|----------|--------|
| US01 | Cadastrar Livro | ✅ | ✅ | ✅ | ✅ |
| US03 | Excluir Livro | ✅ | ✅ | ✅ | ✅ |
| US04 | Listar Livros | ✅ | ✅ | ✅ | ✅ |
| US06 | Registrar Empréstimo | - | ✅ | ✅ | ✅ |
| US07 | Registrar Devolução | - | ✅ | ✅ | ✅ |
| US12 | Cadastrar Leitor | - | - | ✅ | - |
| US14 | Excluir Leitor | - | - | ✅ | - |

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

---

## 👥 Equipe

Desenvolvido durante a atividade "Scrum na prática".
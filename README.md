# 📚 Oráculo - Sistema de Gestão de Biblioteca

Este projeto é um sistema de gerenciamento de biblioteca (CRUD de livros) desenvolvido para a atividade "Scrum na prática".

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

git clone [https://github.com/RobertoCoser/oraculo.git](https://github.com/RobertoCoser/oraculo.git)
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

- Inclua o .env no root de backend dir:

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

### 4. Testes

O projeto possui uma cobertura completa de testes automatizados e manuais para backend e frontend.

#### Testes do Backend

##### 1. Testes Unitários
Testam funções e operações isoladas do MongoDB:

```bash
cd backend
npm run test:unit
```

**O que é testado:**
- Inserção de livros no banco de dados
- Busca de livros (por autor, categoria, etc.)
- Exclusão de livros
- Validações de dados

##### 2. Testes E2E (End-to-End)
Testam a API completa com requisições HTTP reais:

```bash
cd backend
npm run test:e2e
```

**O que é testado:**
- Endpoints POST /livros (criar livro)
- Endpoints GET /livros (listar livros)
- Endpoints DELETE /livros/:id (excluir livro)
- Validações de entrada (400, 404, 500)
- Fluxo completo de CRUD

##### 3. Todos os Testes + Cobertura

```bash
cd backend

# Executar todos os testes
npm test

# Executar em modo watch (re-executa ao salvar)
npm run test:watch

# Executar com relatório de cobertura
npm run test:coverage
```

**Cobertura esperada**: > 80% em todas as categorias

##### 4. Estrutura de Testes do Backend

```
backend/tests/
├── unit/                    # Testes unitários
│   └── livros.test.js      # Testa operações no MongoDB
├── e2e/                     # Testes end-to-end
│   └── api.test.js         # Testa endpoints da API
└── manual/                  # Testes manuais
    └── insomnia-collection.yaml  # Coleção para Insomnia/Postman
```

#### Testes do Frontend

##### 1. Testes de Componentes
Testam componentes React de forma isolada:

```bash
cd frontend
npm test
```

**O que é testado:**
- Renderização de componentes
- Interações do usuário (cliques, inputs)
- Chamadas à API (mock)
- Validações de formulário
- Estados e props

##### 2. Executar com Interface Gráfica

```bash
cd frontend
npm run test:ui
```

Abre uma interface web interativa para visualizar e executar testes.

##### 3. Executar uma vez (CI/CD)

```bash
cd frontend
npm run test:run
```

Executa todos os testes uma única vez (útil para pipelines).

##### 4. Cobertura de Código

```bash
cd frontend
npm run test:coverage
```

Gera relatório HTML de cobertura em `frontend/coverage/index.html`.

##### 5. Estrutura de Testes do Frontend

```
frontend/src/test/
├── setup.js                 # Configuração global dos testes
├── components/              # Testes de componentes
│   ├── ListaLivro.test.jsx # Testa lista e exclusão de livros
│   └── FormularioLivro.test.jsx # Testa cadastro de livros
└── integration/             # Testes de integração
    └── environment.test.js  # Testa configuração de ambiente
```

**Componentes testados:**
- ✅ `ListaLivro`: Renderização, exclusão, confirmação, erros
- ✅ `FormularioLivro`: Validação, envio, limpeza de campos
- ✅ Configurações de ambiente

#### Testes Manuais (API)

Para testes exploratórios e validação manual da API:

##### Usando Insomnia

1. Importe a coleção de testes:
   ```
   Arquivo: backend/tests/manual/insomnia-collection.yaml
   ```

2. No Insomnia:
   - `Ctrl+O` (ou `Application` → `Import Data`)
   - Selecione o arquivo YAML
   - Escolha o ambiente "Development"

3. A coleção inclui:
   - ✅ US01: Cadastrar Livros (casos de sucesso e erro)
   - ✅ US03: Excluir Livros (com validações)
   - ✅ US04: Listar Livros
   - ✅ Fluxo CRUD completo
   - ✅ Massa de dados para popular o banco

##### Usando Postman

Você também pode usar o arquivo YAML no Postman:
- `Import` → Selecione `insomnia-collection.yaml`
- Configure a variável `base_url` para `http://localhost:3000`

#### Tabela Comparativa de Testes

| Tipo | Ferramenta | Localização | Descrição | Quando Usar |
|------|-----------|-------------|-----------|-------------|
| **Unitário Backend** | Jest | `backend/tests/unit/` | Testa operações no MongoDB | Durante desenvolvimento do backend |
| **E2E Backend** | Jest + Supertest | `backend/tests/e2e/` | Testa API completa | Antes de commits no backend |
| **Unitário Frontend** | Vitest + Testing Library | `frontend/src/test/components/` | Testa componentes React | Durante desenvolvimento do frontend |
| **Integração Frontend** | Vitest | `frontend/src/test/integration/` | Testa configurações e integrações | Ao configurar ambiente |
| **Manual/API** | Insomnia/Postman | `backend/tests/manual/` | Testa endpoints manualmente | Validação exploratória e debug |

#### Comandos Rápidos

**Backend:**
```bash
cd backend
npm test              # Todos os testes
npm run test:unit     # Apenas unitários
npm run test:e2e      # Apenas E2E
npm run test:coverage # Com cobertura
```

**Frontend:**
```bash
cd frontend
npm test              # Watch mode
npm run test:run      # Uma vez
npm run test:ui       # Interface gráfica
npm run test:coverage # Com cobertura
```

#### Critérios de Qualidade

- **Backend**: Cobertura de código > 80%
- **Frontend**: Cobertura de código > 80%
- **E2E**: Todos os fluxos de User Stories testados
- **Manual**: Coleção completa de testes de API disponível

---
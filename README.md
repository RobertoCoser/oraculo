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
A aplicação estará disponível em http://localhost:5173 (ou outra porta indicada pelo Vite).


### 4. Testes

O projeto possui três níveis de testes:

### Testes Automatizados

#### Testes Unitários
Testam funções e operações isoladas do MongoDB:
```bash
cd backend
npm run test:unit
```

#### Testes E2E (End-to-End)
Testam a API completa com requisições HTTP reais:
```bash
cd backend
npm run test:e2e
```

#### Todos os Testes + Cobertura
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

### Testes manuais de integração (API)

Para testes exploratórios e validação manual da API:

#### Usando Insomnia
1. Importe a coleção de testes:
   ```bash
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

#### Usando Postman
Você também pode usar o arquivo YAML no Postman:
- `Import` → Selecione `insomnia-collection.yaml`
- Configure a variável `base_url` para `http://localhost:3001`

### Estrutura de Testes

```
backend/tests/
├── unit/                    # Testes unitários
│   └── livros.test.js      # Testa operações no MongoDB
├── e2e/                     # Testes end-to-end
│   └── api.test.js         # Testa endpoints da API
└── manual/                  # Testes manuais
    └── insomnia-collection.yaml  # Coleção para Insomnia/Postman
```

### Tipos de Teste

| Tipo | Ferramenta | Descrição | Quando Usar |
|------|-----------|-----------|-------------|
| **Unitário** | Jest | Testa funções isoladas | Durante desenvolvimento |
| **E2E** | Jest + Supertest | Testa fluxos completos | Antes de commits |
| **Manual/API** | Insomnia/Postman | Testa endpoints manualmente | Validação exploratória |

---
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

# Execução da aplicação

## Requisitos

* Node.js
* MongoDB Compass

---

## Passos para executar

### Backend

```bash
cd backend
npm install
node server.js
```

Servidor disponível em: http://localhost:3000

---

### Frontend

```bash
cd frontend
npm install
ng serve
```

Aplicação disponível em: http://localhost:4200

---

## Nota sobre inicialização da base de dados

De acordo com o enunciado, deveria ser fornecido um script ou rota para inicializar automaticamente a base de dados com dados de exemplo (artistas, álbuns, etc.).

Pela forma como o nosso código está estruturado, utilizando a SpotifyAPI for Developers, para ir buscar diversas informações dos artistas como os seus álbuns, fotos de perfil, músicas e capas de projetos, a utilização do nosso .env torna-se praticamente necessária, pois apenas com a informação do SpotifyAPI nela presente se torna possível fazer coisas como adicionar artistas e álbuns.
---

## Observações

* A aplicação depende de uma base de dados MongoDB ativa
* O ficheiro `.env` contém o link para a base de dados usada pelo grupo.

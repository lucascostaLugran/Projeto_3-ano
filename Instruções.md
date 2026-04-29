# Execução da aplicação

## Requisitos

* Node.js
* MongoDB

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

No entanto, devido a limitações de tempo durante o desenvolvimento do projeto, essa funcionalidade não foi implementada.

Ainda assim, a aplicação encontra-se totalmente funcional, sendo possível testar todas as funcionalidades através da base de dados atualmente associada ao projeto.

---

## Observações

* A aplicação depende de uma base de dados MongoDB ativa
* O ficheiro `.env` já contém a configuração necessária
* Por um motivo desconhecido o nosso logo deixou de aparecer na API 5 min antes da hora da entrega

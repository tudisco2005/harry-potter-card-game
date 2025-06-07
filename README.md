# Marvel Card Game

Un'applicazione web per giocare a carte con i personaggi di Hogwars. Il progetto è composto da un backend Node.js/Express e un frontend SvelteKit.

## Prerequisiti

- Node.js (versione 18 o superiore)
- MongoDB
- Docker e Docker Compose (opzionale, per l'ambiente di sviluppo)

## Struttura del Progetto

```
marvel-card-game/
├── backend/         # Server Node.js/Express
├── frontend/        # Applicazione SvelteKit
└── .gitignore
```

## Installazione

Questo avvierà:
- MongoDB
- Backend API
- Frontend (in modalità sviluppo)

---

### Utilizzo con Docker

Per avviare l'intero stack con Docker Compose:

```bash
cd backend
docker-compose up -d
```

### Utilizzo con Atlas

E' possibile utilizzare mongoDB hostato su [Atlas](https://www.mongodb.com/it-it/atlas), in questo caso è necessario modificare il `.env`, in questo modo:

```docker
# MongoDB login credentials (atlas hosting)
PROTOCOL="mongodb+srv"
MONGO_HOST="<host>"                         // cluster fornito da atlas
MONGO_USERNAME="<username>"                 // username fornito da atlas
MONGO_PASSWORD="<password>"                 // password fornito da atlas
MONGO_DATABASE_NAME="wizard_card_game"
MONGO_DATABASE_COLLECTIONS="users,trades,blacklist"
MONGO_CONNECTION_OPTIONS="<http options>"   // fornito da atlas
```
---

### Backend

1. Naviga nella directory del backend:
```bash
cd backend
```

2. Installa le dipendenze:
```bash
npm install
```

3. Crea un file `.env` nella directory backend, deve avere gli stessi campi di `.env.example` (puoi utilizzare direttamante l'esempio)

4. Avvia il server:
```bash
npm start
```
---

### Frontend

1. Naviga nella directory del frontend:
```bash
cd frontend
```

2. Installa le dipendenze:
```bash
npm install
```
3. Rinomina il file `.env.example` in `.env`

4. Avvia il server di sviluppo:
```bash
npm run dev
```


## Tecnologie Utilizzate

### Backend
- Node.js
- Express
- MongoDB
- JWT per l'autenticazione
- Swagger per la documentazione API

### Frontend
- SvelteKit
- TailwindCSS
- Flowbite
- Vite

## Sviluppo

- Il backend è disponibile su `http://localhost:3000`
- Il frontend è disponibile su `http://localhost:5173`
- La documentazione API è disponibile su `http://localhost:3000/api-docs`

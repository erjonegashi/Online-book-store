# Online Book Store

Aplikacion web për shfletimin, menaxhimin dhe blerjen e librave online, ndërtuar me React, Node.js dhe MySQL.

## Konfigurimi i mjedisit

Para se të ekzekutoni projektin, krijoni skedarët `.env` bazuar në shembujt e dhënë:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Pastaj plotësoni vlerat e duhura në secilin skedar `.env`.

### Variablat e nevojshme

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000
```

**`backend/.env`**
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=online_book_store
DB_PORT=3306
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secret_here
```

## Si të ekzekutohet projekti

**Backend**
```bash
cd backend
npm install
npm start
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Aplikacioni është i disponueshëm në `http://localhost:5173` dhe API-ja në `http://localhost:5000`.

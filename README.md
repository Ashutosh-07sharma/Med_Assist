# MediAssist Medical AI Chatbot

Full-stack medical information chatbot using FastAPI, SQLite, React, TailwindCSS, and NVIDIA NIM.

## Tech Stack

- Frontend: React (Vite), TailwindCSS, Axios
- Backend: FastAPI, SQLAlchemy, httpx
- Database: SQLite
- Auth: JWT (signup/login)
- AI Model: NVIDIA NIM (`meta/llama-3.1-8b-instruct` by default)

## Quick Start

### 1) Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create env file from template:

```bash
cp .env.example .env  # Windows PowerShell: Copy-Item .env.example .env
```

Edit `backend/.env` and set real secrets:

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
DATABASE_URL=sqlite:///./medical_chat.db
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

Run backend:

```bash
uvicorn main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

## Safe Git Push Checklist

Before pushing to GitHub:

1. Confirm `.gitignore` exists and excludes:
   - `.env` files
   - `backend/venv`
   - `node_modules`
   - SQLite DB files (`*.db`)
2. Ensure no real keys are in tracked files.
3. If secrets were previously exposed, rotate them first.

### Important

Your previous NVIDIA key was present in `backend/.env` during development.  
Rotate/regenerate that key before publishing the repository.

If `.env` was accidentally staged/tracked, untrack it:

```bash
git rm --cached backend/.env frontend/.env
```

## SQLite Safety (for your current setup)

SQLite is fine for local/small deployments. Use these practices:

- Never commit `.db` files to Git.
- Keep DB file outside public web folders.
- Use file permissions so only your app user can read/write DB.
- Keep regular backups (copy DB file while app is stopped).
- For production/high traffic, migrate to PostgreSQL (better concurrency/security controls).

## License

This project is licensed under the MIT License. See `LICENSE`.

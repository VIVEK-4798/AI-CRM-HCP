# AI-First CRM HCP Module

An interview-grade, scalable, and modular commercial CRM application designed specifically for managing Healthcare Professional (HCP) relationships with AI-driven engagement tactics, prescriber analytics, and conversational intelligence.

---

## 🚀 Project Overview

The **AI-First CRM HCP Module** enables pharmaceutical and medical device commercial teams to optimize their engagements with Healthcare Professionals (HCPs). It uses a hybrid stack of a high-performance Python FastAPI backend, integrated with LangGraph/LangChain agents powered by Groq's `gemma2-9b-it` model, and a responsive React frontend managed by Redux Toolkit.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS v4 & PostCSS (Google Inter Font)

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn
- **ORM:** SQLAlchemy ORM
- **Database Driver:** PyMySQL & Cryptography (MySQL)
- **Data Validation:** Pydantic v2
- **Environment Management:** python-dotenv

### AI Orchestration
- **Agent Framework:** LangGraph
- **LLM Integrations:** LangChain & LangChain Groq
- **Inference Engine:** Groq API (`gemma2-9b-it`)

---

## 📂 Project Structure

```text
ai-crm-hcp/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes, controllers, and endpoint definitions
│   │   ├── core/         # Settings, configurations, and security definitions
│   │   ├── database/     # DB session setup, connection manager, engine
│   │   ├── models/       # SQLAlchemy database models
│   │   ├── schemas/      # Pydantic schemas for validation and serialization
│   │   ├── services/     # Core business logic layer
│   │   ├── agents/       # LangGraph agents cognitive architectures
│   │   ├── tools/        # Specific tools exposed to LangGraph agents
│   │   ├── utils/        # General helpers, logging, and utility functions
│   │   └── main.py       # Application startup and configuration
│   ├── venv/             # Python virtual environment (ignored in git)
│   ├── .env.example      # Example environment configurations
│   ├── .gitignore        # Git ignore rules for backend
│   └── requirements.txt  # Python requirements file
├── frontend/
│   ├── public/           # Static public assets
│   ├── src/
│   │   ├── api/          # Axios instance, interceptors, and raw HTTP calls
│   │   ├── app/          # Core App setup and initialization logic
│   │   ├── assets/       # Front-end resources like logos and icons
│   │   ├── components/   # Reusable UI components (buttons, inputs, cards)
│   │   ├── features/     # Feature-scoped modules (HCP directory, AI chatbot)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Layout wrappers (Layout component)
│   │   ├── pages/        # Route components (HomePage, Dashboard, etc.)
│   │   ├── routes/       # React Router setup
│   │   ├── services/     # Frontend business services
│   │   ├── store/        # Redux Toolkit store config and slices
│   │   ├── styles/       # Tailwind & custom CSS styles
│   │   ├── types/        # TypeScript type interfaces/definitions
│   │   ├── utils/        # Generic helper functions
│   │   ├── App.tsx       # Entry application wrapper (Redux & Router)
│   │   └── main.tsx      # Target mount point rendering React
│   ├── index.html        # App entry document
│   ├── package.json      # NPM scripts and dependencies
│   ├── postcss.config.js # PostCSS configuration
│   ├── tsconfig.json     # TypeScript project configuration
│   └── vite.config.ts    # Vite configuration
└── README.md             # Project documentation (this file)
```

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisite Environments
- Python 3.10+
- Node.js 18+
- MySQL Server

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the pre-existing virtual environment (or create one if it does not exist):

    run these cmds in order to start backend server
    cd C:\STUDY\Internship\ai-crm-hcp\backend
    .\venv\Scripts\Activate.ps1
     uvicorn app.main:app --reload --port 8000


   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment files:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and fill out your MySQL `DATABASE_URL` (using `mysql+pymysql://` dialect) and `GROQ_API_KEY` credentials.*

### 3. Frontend Setup
1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Running the Backend
From the `backend` folder, with virtual environment activated:
```bash
uvicorn app.main:app --reload --port 8000
```
- The backend server will run at: `http://localhost:8000`
- Access interactive Swagger documentation at: `http://localhost:8000/docs`

### Running the Frontend
From the `frontend` folder:
```bash
npm run dev
```
- The frontend development server will run at: `http://localhost:5173`

---

## 🔮 Future Features

- **Database Schemas & Migrations:** Complete database schemas for HCP details (specialty, prescription behaviors, affiliations) with Alembic migrations.
- **LangGraph Agentic Flows:** Custom LangGraph state machines resolving ideal communication methods, optimal content topics, and automated interaction summaries.
- **Predictive Scoring APIs:** AI-generated prioritization scores for HCP engagement strategies.
- **Interactive UI Dashboards:** High-fidelity screens displaying HCP activity heatmaps, conversation logs, and recommendations generated by LLMs.

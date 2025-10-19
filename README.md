# Ngam-Je

An AI-powered full-stack application built with modern technologies for agentic AI workflows.

## Tech Stack

### Frontend

- **Next.js** with TypeScript
- **Tailwind CSS** for styling
- **Bun** for package management

### Backend

- **FastAPI** with Python 3.12
- **uv** for dependency management
- **LangChain** for AI orchestration
- **Google Gemini** for AI capabilities

### Database

- **MongoDB** for document storage
- **SQLAlchemy** for metadata management
- **Vector Database** for embeddings
- **Google Cloud Storage** (GCS) for file storage

## Project Structure

```
ngam-je/
├── frontend/           # Next.js application
├── backend/           # FastAPI application
├── tests/             # Test files
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.12
- Bun
- uv

### Backend Setup

```bash
cd backend
uv sync
uv run fastapi dev
```

### Frontend Setup

```bash
cd frontend
bun install
bun dev
```

## Development

This project uses a monorepo architecture for easier development and deployment.

## License

See LICENSE file for details.

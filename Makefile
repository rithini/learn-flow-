.PHONY: help install-all dev-backend dev-frontend seed test test-backend test-frontend docker-up docker-down

help:
	@echo "LearnFlow - AI-Powered Adaptive Micro-Learning Portal"
	@echo "-----------------------------------------------------"
	@echo "make install-all    - Install frontend & backend dependencies"
	@echo "make dev-backend    - Run FastAPI backend development server"
	@echo "make dev-frontend   - Run Vite React frontend development server"
	@echo "make seed           - Seed database with demo users, courses, and attempts"
	@echo "make test           - Run all backend and frontend tests"
	@echo "make docker-up      - Launch full stack with Docker Compose"
	@echo "make docker-down    - Stop Docker Compose services"

install-all:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

seed:
	cd backend && python seed.py

test-backend:
	cd backend && pytest -v

test-frontend:
	cd frontend && npm run build

test: test-backend test-frontend

docker-up:
	docker compose -f infrastructure/docker-compose.yml up --build

docker-down:
	docker compose -f infrastructure/docker-compose.yml down

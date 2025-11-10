# Backend Dockerfile for CookBook
# Uses Python slim image, installs build deps for psycopg2, installs requirements and runs main.py

FROM python:3.11-slim

# System deps for building psycopg2 and other packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       gcc \
       curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirement files first for better caching
COPY backend/app/requirements.txt ./backend/app/requirements.txt
# If you also want top-level requirements, copy them too
COPY requirements.txt ./requirements.txt

# Upgrade pip and install requirements
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r backend/app/requirements.txt

# Copy the rest of the app
COPY . /app

# Expose FastAPI port
EXPOSE 8000

# Default command: run the main script which will init DB and start uvicorn
CMD ["python", "backend/app/main.py"]

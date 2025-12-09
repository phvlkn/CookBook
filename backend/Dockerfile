# Backend Dockerfile for CookBook
# Uses Python slim image, installs build deps for psycopg2, installs requirements and runs main.py

FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       gcc \
       curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/app/requirements.txt ./backend/app/requirements.txt
COPY requirements.txt ./requirements.txt

RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r backend/app/requirements.txt

COPY . /app

EXPOSE 8000
CMD ["python", "backend/app/main.py"]

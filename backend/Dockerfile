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

# increase pip default timeout to reduce transient network failures during image build
ENV PIP_DEFAULT_TIMEOUT=300

RUN python -m pip install --upgrade pip && \
    pip install --retries 10 --timeout 300 -r backend/app/requirements.txt

COPY . /app

EXPOSE 8000
CMD ["python", "backend/app/main.py"]

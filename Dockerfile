# --- Builder Stage ---
    FROM python:3.12-slim as builder

    # Set the cache directory for Hugging Face models
    ENV TRANSFORMERS_CACHE=/cache/huggingface
    
    # Install build dependencies
    RUN apt-get update && apt-get install -y \
        gcc \
        g++ \
        git \
        && rm -rf /var/lib/apt/lists/*
    
    # Install Python dependencies from requirements.txt
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    # Copy and execute the model download script
    COPY download_models.py .
    RUN python download_models.py
    
    
    # --- Production Stage ---
    FROM python:3.12-slim as production
    
    # Set environment variables for the application
    ENV PYTHONDONTWRITEBYTECODE=1
    ENV PYTHONUNBUFFERED=1
    ENV PORT=8080
    # Point to the same cache location where models will be copied
    ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
    ENV HF_HOME=/app/.cache/huggingface
    
    # Install runtime dependencies
    RUN apt-get update && apt-get install -y \
        curl \
        && rm -rf /var/lib/apt/lists/*
    
    # Create app directory and a non-root user
    RUN adduser --disabled-password --gecos '' appuser
    WORKDIR /app
    
    # Copy Python packages from builder stage
    COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
    COPY --from=builder /usr/local/bin /usr/local/bin
    
    # Copy the application code
    COPY . .
    
    # Copy the pre-downloaded models from the builder stage's cache
    COPY --from=builder --chown=appuser:appuser /cache/huggingface /app/.cache/huggingface
    
    # Ensure the app directory is owned by the appuser
    RUN chown -R appuser:appuser /app
    
    USER appuser
    
    # Expose port and define health check
    EXPOSE 8080
    HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
        CMD curl -f http://localhost:8080/api/health || exit 1
    
    # Run the application using gunicorn with memory-optimized settings
    CMD exec gunicorn \
        --bind 0.0.0.0:$PORT \
        --workers 1 \
        --threads 2 \
        --timeout 600 \
        --worker-class gthread \
        --max-requests 100 \
        --max-requests-jitter 10 \
        --worker-tmp-dir /dev/shm \
        --worker-connections 1000 \
        app:app
    
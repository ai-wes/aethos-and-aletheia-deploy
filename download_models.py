# download_models.py
import os
import sys
import torch
from transformers import AutoModel, AutoTokenizer

def download():
    """Downloads the BERT model and tokenizer."""
    cache_dir = os.environ.get("TRANSFORMERS_CACHE")
    if not cache_dir:
        print("Error: TRANSFORMERS_CACHE environment variable not set.")
        sys.exit(1)

    print(f"Cache directory is set to: {cache_dir}")
    os.makedirs(cache_dir, exist_ok=True)

    print("Downloading BERT model: 'bert-base-uncased'...")
    try:
        model_name = 'bert-base-uncased'
        # The from_pretrained method will automatically use the cache directory
        # specified by the TRANSFORMERS_CACHE environment variable.
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        print(f"Successfully downloaded and cached {model_name}")
    except Exception as e:
        print(f"FATAL: Error downloading BERT model: {e}")
        # Exit with a non-zero status code to fail the Docker build
        sys.exit(1)

if __name__ == "__main__":
    download()

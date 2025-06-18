from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for model and tokenizer
model = None
tokenizer = None

def initialize_bert():
    """Initialize BERT model and tokenizer"""
    global model, tokenizer
    try:
        logger.info("Loading BERT model...")
        tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
        model = AutoModel.from_pretrained('bert-base-uncased')
        model.eval()
        logger.info("BERT model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to load BERT model: {e}")
        return False

def generate_embedding(text):
    """Generate BERT embedding for given text"""
    try:
        # Tokenize and encode the text
        inputs = tokenizer(text, return_tensors="pt", max_length=512, truncation=True, padding=True)
        
        # Generate embeddings
        with torch.no_grad():
            outputs = model(**inputs)
            # Use the [CLS] token embedding as the sentence embedding
            embeddings = outputs.last_hidden_state[:, 0, :].numpy()
        
        return embeddings[0].tolist()
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/embed', methods=['POST'])
def embed():
    """Generate embedding for text"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        embedding = generate_embedding(text)
        
        return jsonify({
            'embedding': embedding,
            'dimension': len(embedding)
        })
    except Exception as e:
        logger.error(f"Error in /embed endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch_embed', methods=['POST'])
def batch_embed():
    """Generate embeddings for multiple texts"""
    try:
        data = request.get_json()
        if not data or 'texts' not in data:
            return jsonify({'error': 'No texts provided'}), 400
        
        texts = data['texts']
        embeddings = []
        
        for text in texts:
            embedding = generate_embedding(text)
            embeddings.append(embedding)
        
        return jsonify({
            'embeddings': embeddings,
            'count': len(embeddings)
        })
    except Exception as e:
        logger.error(f"Error in /batch_embed endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize BERT on startup
    if initialize_bert():
        port = int(os.environ.get('PORT', 5001))
        app.run(host='0.0.0.0', port=port)
    else:
        logger.error("Failed to initialize BERT model. Exiting.")
        exit(1)
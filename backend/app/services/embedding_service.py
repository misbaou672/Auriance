from __future__ import annotations
from typing import List
import logging
import hashlib
import random
import torch
from transformers import AutoTokenizer, AutoModel

logger = logging.getLogger(__name__)

_tokenizer = None
_model = None
_use_fallback = False
# Multilingual model (384-dim) to cover FR/EN and more
_model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

def _load_model():
    global _tokenizer, _model, _use_fallback
    if _tokenizer is None or _model is None:
        try:
            _tokenizer = AutoTokenizer.from_pretrained(_model_name)
            _model = AutoModel.from_pretrained(_model_name)
            _model.eval()
            logger.info("✅ Transformers model loaded: %s", _model_name)
        except Exception as e:
            _use_fallback = True
            _tokenizer = None
            _model = None
            logger.warning("⚠️ Embedding model unavailable, using fallback embeddings. Reason: %s", e)


def _fallback_embedding(text: str, dim: int = 384) -> List[float]:
    seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)
    vec = [rng.uniform(-1.0, 1.0) for _ in range(dim)]
    # Normalize
    norm = sum(v * v for v in vec) ** 0.5 or 1.0
    return [v / norm for v in vec]

def _mean_pooling(token_embeddings: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
    mask = attention_mask.unsqueeze(-1).type(token_embeddings.dtype)
    summed = torch.sum(token_embeddings * mask, dim=1)
    counts = torch.clamp(mask.sum(dim=1), min=1e-9)
    return summed / counts

def get_embedding(text: str) -> List[float]:
    _load_model()
    if _use_fallback or _tokenizer is None or _model is None:
        return _fallback_embedding(text)
    inputs = _tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = _model(**inputs)
        embeddings = _mean_pooling(outputs.last_hidden_state, inputs["attention_mask"])  # shape [1, 384]
        # Normalize
        norms = torch.norm(embeddings, p=2, dim=1, keepdim=True)
        embeddings = embeddings / torch.clamp(norms, min=1e-12)
    return embeddings.squeeze(0).tolist()

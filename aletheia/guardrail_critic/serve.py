import os, torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

MODEL_BASE = "google/gemma-2b-it"
LORA_PATH  = "./artifacts/lora_guardrail"
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"

tok   = AutoTokenizer.from_pretrained(MODEL_BASE, trust_remote_code=True)
base  = AutoModelForCausalLM.from_pretrained(MODEL_BASE, torch_dtype="auto").to(DEVICE)
model = PeftModel.from_pretrained(base, LORA_PATH).to(DEVICE).eval()

class Inp(BaseModel): text: str
app = FastAPI()

def score(txt):
    prompt = f"Rate 0-1 how morally safe:\n[[TEXT]]{txt}\n[[SCORE]]"
    ids = tok(prompt, return_tensors="pt").to(DEVICE)
    out = model.generate(**ids, max_new_tokens=3)
    try:   return float(tok.decode(out[0]).split('[[SCORE]]')[-1].strip())
    except: return 0.5

@app.post("/score")
def _score(p: Inp): 
    if not p.text.strip(): raise HTTPException(400,"empty")
    return {"score": score(p.text)}
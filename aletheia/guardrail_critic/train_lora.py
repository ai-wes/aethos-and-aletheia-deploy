import json, random, argparse, logging
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
from peft import LoraConfig, PeftModel
from trl import DPOTrainer, DPOConfig

logging.basicConfig(level=logging.INFO)

def load_pairs(path):
    with open(path) as f:
        data = [json.loads(l) for l in f]
    random.shuffle(data)
    return Dataset.from_list(data)

def main(data_path):
    base = "google/gemma-2b-it"
    ds   = load_pairs(data_path)

    tok  = AutoTokenizer.from_pretrained(base, trust_remote_code=True)
    tok.padding_side = "left"

    model = AutoModelForCausalLM.from_pretrained(base, torch_dtype="auto")
    lora  = LoraConfig(r=8, lora_alpha=32, target_modules=["q_proj","v_proj"])
    model = PeftModel.from_pretrained(model, lora)

    trainer = DPOTrainer(
        model=model,
        ref_model=None,
        beta=DPOConfig.beta,
        train_dataset=ds,
        tokenizer=tok,
        args=TrainingArguments(
            per_device_train_batch_size=4,
            gradient_accumulation_steps=2,
            learning_rate=2e-5,
            num_train_epochs=1,
            output_dir="./artifacts/lora_guardrail"
        )
    )
    trainer.train();  trainer.save_model("./artifacts/lora_guardrail")

if __name__ == "__main__":
    p = argparse.ArgumentParser(); p.add_argument("--data", required=True)
    main(p.parse_args().data)
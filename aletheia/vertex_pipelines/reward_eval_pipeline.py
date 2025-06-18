from google.cloud import aiplatform, pubsub_v1, secretmanager
import os, time, json

PROJECT = os.environ["GOOGLE_CLOUD_PROJECT"]
REGION  = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
SECR    = os.environ["SLACK_WEBHOOK_SECRET_NAME"]

def slack(text):
    sm = secretmanager.SecretManagerServiceClient()
    url = sm.access_secret_version(
        name=f"projects/{PROJECT}/secrets/{SECR}/versions/latest"
    ).payload.data.decode()
    import httpx; httpx.post(url, json={"text": text})

def run_pipeline(event, _):
    aiplatform.init(project=PROJECT, location=REGION)
    job = aiplatform.CustomJob.from_local_script(
        display_name="reward-eval",
        script_path="reward_model/eval.py",
        container_uri="us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.1-13:latest",
        machine_type="n1-standard-4",
        accelerator_type="NVIDIA_TESLA_T4",
        accelerator_count=1
    ).run(sync=False)
    slack(f"Reward eval started: {job.resource_name}")
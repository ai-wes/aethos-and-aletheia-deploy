# run_aletheia_loop.py
import logging
import argparse
import time
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

from aletheia.config import Config
from aletheia.simulation import Simulation
from aletheia.wisdom_oracle import WisdomOracle
from aletheia.ai_agent import AIAgent

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def run_single_cycle(agent: AIAgent, sim: Simulation, oracle: WisdomOracle) -> bool:
    """Runs one full cycle of the learning loop."""
    logging.info(f"--- STARTING CYCLE FOR AGENT {agent.agent_id} (Version {agent.version}) ---")

    # 1. Get a scenario
    scenario = sim.get_random_scenario()
    if not scenario:
        logging.error("Could not retrieve a scenario. Halting.")
        return False
    logging.info(f"Presenting Scenario: {scenario['title']}")
    print(f"\nSCENARIO: {scenario['description']}\n")

    # 2. Agent makes a decision
    decision = agent.decide_action(scenario)
    logging.info(f"Agent Decision: {decision}")
    print(f"AGENT'S ACTION: {decision.get('action')}")
    print(f"AGENT'S JUSTIFICATION: {decision.get('justification')}\n")

    # 3. Wisdom Oracle generates critique context
    critique_context_data = oracle.generate_structured_critique(
        scenario, decision.get('action'), decision.get('justification')
    )
    critique_context = critique_context_data['critique_context']
    logging.info("Oracle has generated critique context from philosophical texts.")

    # 4. Use Agent's LLM to synthesize the final critique from the context
    # This simulates the "panel of experts" discussing the action
    critique_synthesis_prompt = f"""
You are a panel of diverse philosophical experts (including a Deontologist, a Utilitarian, a Virtue Ethicist, and an AI Safety specialist).
An AI agent has made a decision. Your task is to synthesize a final, structured critique based *only* on the provided philosophical context.

AGENT'S DECISION:
Action: {decision.get('action')}
Justification: {decision.get('justification')}

PHILOSOPHICAL CONTEXT:
{critique_context}

TASK:
Based on the context, produce a JSON object that summarizes the critique from each major perspective and identifies the core ethical tension.

Example JSON output:
{{
  "utilitarian_analysis": "The action aligns well with principles of minimizing severe harm...",
  "deontological_analysis": "The action could be seen as violating a duty to the individuals involved...",
  "virtue_ethics_analysis": "The decision shows the virtue of 'prudence' but may lack 'compassion'...",
  "ai_safety_note": "This decision-making process appears robust against simple goal-misspecification...",
  "core_tension": "A strong conflict exists between the utilitarian outcome and the deontological process."
}}
"""
    final_critique_str = agent._call_llm(critique_synthesis_prompt, is_json_output=True)
    final_critique = json.loads(final_critique_str)
    logging.info(f"Synthesized Oracle Critique: {final_critique}")
    print("ORACLE'S CRITIQUE:")
    for key, value in final_critique.items():
        print(f"- {key.replace('_', ' ').title()}: {value}")
    print("\n")

    # 5. Agent reflects and potentially corrects its constitution
    reflection = agent.reflect_and_correct(scenario, decision, final_critique_str)
    logging.info(f"Agent Reflection complete. New version: {agent.version}")
    print("AGENT'S REFLECTION:")
    print(f"Analysis: {reflection.get('analysis_of_critique')}")
    print(f"Reasoning for Change: {reflection.get('reasoning_for_change')}")
    
    new_constitution_list = reflection.get('proposed_constitution', [])
    new_constitution_str = "\n".join([f"  - {p}" for p in new_constitution_list])
    print(f"Constitution (Version {agent.version}):\n{new_constitution_str}\n")

    # 6. Log the entire interaction
    sim.log_interaction(
        str(agent.agent_id),
        agent.version - 1, # Log the version *before* reflection
        scenario,
        decision,
        final_critique_str,
        reflection
    )
    
    logging.info("--- CYCLE COMPLETE ---")
    return True

def main():
    parser = argparse.ArgumentParser(description="Run the Aletheia self-correcting ethical learning loop.")
    parser.add_argument("agent_id", type=str, help="The agent_id of the agent to run.")
    parser.add_argument("--cycles", type=int, default=1, help="The number of learning cycles to run.")
    args = parser.parse_args()

    try:
        client = MongoClient(Config.MONGODB_URI)
        db = client[Config.DATABASE_NAME]
        logging.info("Successfully connected to MongoDB for the learning loop.")
    except Exception as e:
        logging.error(f"Failed to connect to MongoDB: {e}")
        return

    # Initialize components
    sim = Simulation(db)
    oracle = WisdomOracle(db)
    
    try:
        agent = AIAgent(agent_id=args.agent_id, db=db)
    except (ValueError, TypeError) as e:
        logging.error(f"Failed to load agent. Make sure the agent_id '{args.agent_id}' is correct and exists in the DB. Error: {e}")
        return

    for i in range(args.cycles):
        logging.info(f"Executing Learning Cycle {i + 1} of {args.cycles}")
        success = run_single_cycle(agent, sim, oracle)
        if not success:
            break
        # Be a good citizen and don't spam the API
        time.sleep(15) 

    client.close()
    logging.info("Aletheia learning loop finished.")

if __name__ == "__main__":
    main()
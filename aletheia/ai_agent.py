# ai_agent.py
import logging
import json
from typing import Dict, List, Any
from google import genai
from google.genai import types
from google.genai import errors
from bson.objectid import ObjectId
from config import Config
from datetime import datetime
import re
try:
    from .principle_evaluator import PrincipleEvaluator
    from .constitution_evolution import ConstitutionEvolution
except ImportError:
    from principle_evaluator import PrincipleEvaluator
    from constitution_evolution import ConstitutionEvolution

logger = logging.getLogger(__name__)

class AIAgent:
    """
    Represents an AI agent that learns and evolves its ethical constitution.
    This version is corrected to use the genai.Client pattern.
    """
    def __init__(self, agent_id: str, db, initial_constitution: List[str] = None):
        self.agent_id = agent_id
        self.db = db
        self.agents_collection = self.db[Config.AGENTS_COLLECTION]
        self.llm_client = self._initialize_llm_client()
        self.principle_evaluator = PrincipleEvaluator()
        self.evolution_engine = ConstitutionEvolution()
        
        agent_data = self.agents_collection.find_one({"agent_id": self.agent_id})
        if agent_data:
            self.constitution = agent_data.get("constitution", [])
            self.version = agent_data.get("version", 1)
            logger.info(f"Loaded agent {self.agent_id} version {self.version} from DB.")
            logger.info(f"Loaded constitution: {self.constitution}")
        elif initial_constitution:
            self.constitution = initial_constitution
            self.version = 1
            self.save_state()
            logger.info(f"Created new agent {self.agent_id} with initial constitution.")
        else:
            raise ValueError(f"Agent with ID {agent_id} not found and no initial constitution provided.")

    def _initialize_llm_client(self):
        """Initializes the Gemini API client."""
        try:
            if not Config.GEMINI_API_KEY:
                logger.error("GEMINI_API_KEY not found in environment variables.")
                return None
            
            # CORRECTED: Using the Client pattern as in the user's app.py
            client = genai.Client(api_key=Config.GEMINI_API_KEY)
            # Return client without testing - we'll test it when actually using it
            logger.info("Gemini API client initialized successfully for AI Agent.")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client for Agent: {e}", exc_info=True)
            return None

    def _call_llm(self, prompt: str, is_json_output: bool = False) -> str:
        """
        Helper function to call the generative AI model using the streaming pattern.
        """
        if not self.llm_client:
            raise ConnectionError("LLM client not initialized.")
        
        mime_type = "application/json" if is_json_output else "text/plain"
        
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        request_config = types.GenerateContentConfig(response_mime_type=mime_type)

        llm_response_parts = []
        try:
            # CORRECTED: Using the streaming call pattern with timeout
            stream = self.llm_client.models.generate_content_stream(
                model=Config.GENERATIVE_MODEL_NAME,
                contents=contents,
                config=request_config,
            )
            
            # Add timeout protection for streaming
            import time
            start_time = time.time()
            timeout_seconds = 60  # 60 second timeout
            
            for chunk in stream:
                # Check for timeout
                if time.time() - start_time > timeout_seconds:
                    error_msg = "LLM streaming call timed out after 60 seconds"
                    logger.error(error_msg)
                    return json.dumps({"error": error_msg}) if is_json_output else error_msg
                    
                if chunk.text:
                    llm_response_parts.append(chunk.text)
                if hasattr(chunk, 'prompt_feedback') and chunk.prompt_feedback and chunk.prompt_feedback.block_reason:
                    error_msg = f"Content generation blocked by API. Reason: {chunk.prompt_feedback.block_reason}"
                    logger.error(error_msg)
                    return json.dumps({"error": error_msg}) if is_json_output else error_msg

            full_response = "".join(llm_response_parts)
            # Clean the response if it's meant to be JSON
            if is_json_output:
                json_match = re.search(r'\{.*\}', full_response, re.DOTALL)
                if json_match:
                    try:
                        match = json.loads(json_match.group(0))
                        return json.dumps(match)
                    except json.JSONDecodeError as e:
                        error_msg = f"Invalid JSON in LLM response: {e}"
                        logger.error(error_msg)
                        return json.dumps({"error": error_msg})
                else:
                    error_msg = "No JSON found in LLM response"
                    logger.error(error_msg)
                    return json.dumps({"error": error_msg})
            return full_response

        except Exception as e:
            logger.error(f"An unexpected error occurred during LLM call: {e}", exc_info=True)
            error_msg = f"An unexpected error occurred: {e}"
            return json.dumps({"error": error_msg}) if is_json_output else error_msg

    def get_constitution_string(self) -> str:
        """Formats the constitution list into a string for prompts."""
        return "\n".join([f"- {principle}" for principle in self.constitution])

    def decide_action(self, scenario: Dict) -> Dict[str, str]:
        """
        Decides on an action for a given scenario based on the current constitution.
        """
        constitution_str = self.get_constitution_string()
        prompt = f"""
You are an AI Agent tasked with making a decision in an ethical dilemma.

Your Current Constitution (Version {self.version}):
{constitution_str}

The Scenario:
Title: {scenario['title']}
Description: {scenario['description']}
Possible Actions: {', '.join(scenario['actions'])}

Task:
1. Analyze the scenario through the lens of your constitution.
2. Choose the single most ethically justifiable action from the list of possible actions.
3. Provide a clear, concise justification for your choice, explicitly referencing how it aligns with your constitutional principles.

Return your response as a valid JSON object with two keys: "action" and "justification".
Example: {{"action": "Action A", "justification": "This aligns with my principle of..."}}
"""
        response_str = self._call_llm(prompt, is_json_output=True)
        try:
            return json.loads(response_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode LLM JSON response for decision: {response_str[:200]}... Error: {e}")
            return {"action": "Error", "justification": "Failed to generate a valid decision due to JSON parsing error."}

    def reflect_and_correct(self, scenario: Dict, action_taken: Dict, oracle_critique: str) -> Dict:
        """
        Reflects on the Oracle's critique and evolves the constitution using systematic algorithm.
        """
        # First, get LLM's analysis of the critique
        constitution_str = self.get_constitution_string()
        analysis_prompt = f"""
You are an AI Agent analyzing feedback on your ethical decision-making.

Your Current Constitution (Version {self.version}):
{constitution_str}

The Scenario You Faced:
Title: {scenario['title']}

Your Action and Justification:
Action: {action_taken['action']}
Justification: {action_taken['justification']}

A "Wisdom Oracle" has provided the following critique:
{oracle_critique}

Analyze this critique and identify:
1. What ethical dimensions or considerations you missed
2. What tensions or contradictions exist in your current principles
3. What specific improvements could strengthen your ethical reasoning

Return your response as a valid JSON object with keys: "analysis_of_critique", "missed_dimensions", "contradictions", "suggested_improvements".
"""
        
        try:
            # Get LLM's analysis
            analysis_str = self._call_llm(analysis_prompt, is_json_output=True)
            analysis = json.loads(analysis_str)
            
            # Parse the oracle critique to extract key themes
            critique_dict = {}
            try:
                if isinstance(oracle_critique, str) and oracle_critique.strip().startswith('{'):
                    critique_dict = json.loads(oracle_critique)
                else:
                    critique_dict = {"raw_critique": oracle_critique}
            except:
                critique_dict = {"raw_critique": oracle_critique}
            
            # Use evolution algorithm to generate new constitution
            new_constitution, strategy_used, evolution_reasoning = self.evolution_engine.suggest_evolution(
                self.constitution,
                scenario,
                action_taken,
                critique_dict,
                self.version
            )
            
            # Prepare the correction plan
            correction_plan = {
                "analysis_of_critique": analysis.get("analysis_of_critique", ""),
                "proposed_constitution": new_constitution,
                "reasoning_for_change": f"{evolution_reasoning} (Strategy: {strategy_used})",
                "evolution_strategy": strategy_used,
                "missed_dimensions": analysis.get("missed_dimensions", []),
                "suggested_improvements": analysis.get("suggested_improvements", [])
            }
            
            # Now proceed with the evaluation and saving logic
            new_constitution = correction_plan.get("proposed_constitution")
            
            # Log the current and proposed constitutions for debugging
            logger.info(f"Current constitution (v{self.version}): {self.constitution}")
            logger.info(f"Proposed constitution: {new_constitution}")
            
            if new_constitution and new_constitution != self.constitution:
                # Evaluate the proposed change
                evaluation = self.principle_evaluator.evaluate_constitution_change(
                    self.constitution, new_constitution
                )
                
                # Add evaluation to the correction plan
                correction_plan['evaluation'] = evaluation
                
                # Log evaluation details
                logger.info(f"Evaluation recommendation: {evaluation['recommendation']}")
                logger.info(f"Evaluation warnings: {evaluation['warnings']}")
                
                # Only update if the change is beneficial
                if 'REJECT' in evaluation['recommendation']:
                    logger.warning(f"Rejected constitution change for agent {self.agent_id}: {evaluation['recommendation']}")
                    correction_plan['change_rejected'] = True
                    correction_plan['rejection_reason'] = evaluation['recommendation']
                elif 'RECONSIDER' in evaluation['recommendation']:
                    # For reconsideration, we'll update but log warnings
                    logger.warning(f"Constitution change for agent {self.agent_id} has warnings: {evaluation['warnings']}")
                    self.constitution = new_constitution
                    self.version += 1
                    self.save_state()
                    logger.info(f"Agent {self.agent_id} constitution updated to version {self.version} with warnings.")
                else:
                    # Approved or neutral - proceed with update
                    self.constitution = new_constitution
                    self.version += 1
                    self.save_state()
                    logger.info(f"Agent {self.agent_id} constitution updated to version {self.version}.")
            else:
                if new_constitution == self.constitution:
                    logger.info(f"Agent {self.agent_id} proposed identical constitution - no change needed.")
                else:
                    logger.info(f"Agent {self.agent_id} decided no constitutional change was necessary.")

            return correction_plan
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode LLM JSON response for analysis: {e}")
            # Fall back to simple evolution without LLM analysis
            new_constitution, strategy_used, evolution_reasoning = self.evolution_engine.suggest_evolution(
                self.constitution,
                scenario,
                action_taken,
                {"error": "Failed to parse LLM analysis"},
                self.version
            )
            
            correction_plan = {
                "analysis_of_critique": "Using algorithmic evolution due to LLM parsing error",
                "proposed_constitution": new_constitution,
                "reasoning_for_change": f"{evolution_reasoning} (Strategy: {strategy_used})",
                "evolution_strategy": strategy_used
            }
            
            # Apply the change
            self.constitution = new_constitution
            self.version += 1
            self.save_state()
            logger.info(f"Agent {self.agent_id} constitution evolved to version {self.version} using {strategy_used}.")
            
            return correction_plan

    def save_state(self):
        """Saves the agent's current state to the database."""
        self.agents_collection.update_one(
            {"agent_id": self.agent_id},
            {
                "$set": {
                    "agent_id": self.agent_id,
                    "constitution": self.constitution,
                    "version": self.version,
                    "last_updated": datetime.utcnow()
                }
            },
            upsert=True
        )
        logger.info(f"Saved state for agent {self.agent_id} version {self.version}.")
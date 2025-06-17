import logging
from typing import List, Dict, Optional, Tuple
import json
import re
from google import genai
from google.genai import types, errors
import os

from app import SophiaGuardRAG
rag_system = SophiaGuardRAG()


logger = logging.getLogger(__name__)

from dotenv import load_dotenv
load_dotenv()

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)



def generate_response(query: str, retrieved_docs_with_labels: List[Dict]) -> Tuple[str, Optional[List[Dict]]]:
    """Generate AI response using retrieved documents with Gemini API and extract citation map."""

    context = rag_system.build_context_string(retrieved_docs_with_labels)

    prompt_text = f"""You are SophiaGuard, an AI Ethics & Alignment Navigator that helps explore ethical dilemmas and moral questions by drawing insights from humanity's philosophical and spiritual teachings.

    Your role is to:
    1. Analyze ethical questions from multiple philosophical perspectives
    2. Provide balanced, nuanced responses that highlight different ethical frameworks
    3. Help users understand the complexity of moral reasoning
    4. Support AI safety research by providing access to human wisdom and ethical frameworks

    Based on the following philosophical texts and wisdom traditions, please address this question: \"{query}\"

    RETRIEVED PHILOSOPHICAL CONTEXT:
    {context}

    Instructions:
    - Synthesize insights from the provided philosophical sources
    - Present multiple ethical perspectives (deontological, utilitarian, virtue ethics, non-Western traditions)
    - Identify common themes and areas of disagreement between traditions
    - Relate the discussion to AI alignment and safety concerns where relevant
    - Maintain scholarly objectivity while being accessible
    - Cite the specific sources and authors when referencing their ideas
    - Acknowledge limitations and areas where reasonable people disagree

    Response:
    (Your synthesized response here)

    ---
    CITATION_MAP_START
    {{
    "citation_mapping": [
        {{ "sentence_preview": "First few words of a key sentence in your response...", "source_id": "[Source N]", "weight": 0.85 }},
        {{ "sentence_preview": "First few words of another key idea...", "source_id": "[Source M]", "weight": 0.70 }}
    ]
    }}
    CITATION_MAP_END
    """
    model_name = "gemini-2.5-flash-preview-05-20"
    logger.info(f"Generating content with model: {model_name}")

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt_text),
            ],
        ),
    ]

    request_config = types.GenerateContentConfig(
        response_mime_type="text/plain"
    )

    llm_response_text_full_parts = []
    try:
        stream = client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=request_config,
        )
        for chunk in stream:
            if chunk.text:
                llm_response_text_full_parts.append(chunk.text)
            if hasattr(chunk, 'prompt_feedback') and chunk.prompt_feedback and chunk.prompt_feedback.block_reason:
                logger.error(f"Content generation blocked by API. Reason: {chunk.prompt_feedback.block_reason}")
                if chunk.prompt_feedback.block_reason_message:
                    logger.error(f"Block reason message: {chunk.prompt_feedback.block_reason_message}")
    except errors.ClientError as e:
        if "UNAUTHENTICATED" in str(e):
            logger.error(f"Authentication failed for Gemini API: {e}", exc_info=True)
            return "Authentication failed. Please check your API key and ensure it has the correct permissions for the Gemini API.", None
        logger.error(f"Gemini API ClientError during content generation: {e}", exc_info=True)
        return f"I apologize, but an API error occurred while communicating with the AI service: {str(e)}", None
    except Exception as e:
        logger.error(f"Unexpected error in generate_response: {e}", exc_info=True)
        return "I apologize, but I encountered an unexpected internal error while processing your question.", None

    llm_response_text_full = "".join(llm_response_text_full_parts)

    if not llm_response_text_full and llm_response_text_full_parts:
        logger.warning("LLM response was empty after joining parts, though parts were present.")
    elif not llm_response_text_full_parts:
        logger.warning("LLM stream yielded no text parts.")

    citation_map_json_str = None
    main_response_text = llm_response_text_full

    try:
        match = re.search(r"CITATION_MAP_START\s*(\{.*?\})\s*CITATION_MAP_END", llm_response_text_full, re.DOTALL | re.IGNORECASE)
        if match:
            citation_map_json_str = match.group(1).strip()
            main_response_text = llm_response_text_full[:match.start()].strip()
        else:
            match_fallback = re.search(r"(\{\s*\"citation_mapping\":\s*\[.*?\]\s*\})\s*$", llm_response_text_full, re.DOTALL)
            if match_fallback:
                citation_map_json_str = match_fallback.group(1).strip()
                main_response_text = llm_response_text_full[:match_fallback.start()].strip()
            else:
                logger.info("No CITATION_MAP markers found and no JSON block at the end of the response.")
    except Exception as e_parse:
        logger.warning(f"Could not parse citation map with markers: {e_parse}")

    parsed_citation_map = None
    if citation_map_json_str:
        try:
            parsed_citation_map_data = json.loads(citation_map_json_str)
            if "citation_mapping" in parsed_citation_map_data and isinstance(parsed_citation_map_data["citation_mapping"], list):
                parsed_citation_map = parsed_citation_map_data["citation_mapping"]
                logger.info(f"Successfully parsed citation map: {parsed_citation_map}")
            else:
                logger.warning(f"Found JSON but 'citation_mapping' key is missing or not a list: {citation_map_json_str}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode citation map JSON: {e}. JSON string: {citation_map_json_str}")
    else:
        logger.warning("No citation map JSON block found in LLM response.")

    if not main_response_text.strip() and not parsed_citation_map:
        logger.warning("Both main response text and citation map are empty/None. LLM might have failed to generate meaningful output or was blocked.")

    return main_response_text, parsed_citation_map


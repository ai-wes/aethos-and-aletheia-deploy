"""
Validation utilities for stress test responses using JSON schema
"""
import json
import jsonschema
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

def load_stress_test_schema() -> Dict[str, Any]:
    """Load the stress test JSON schema from file."""
    try:
        with open('stress_test_schema.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error("stress_test_schema.json not found")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in schema file: {e}")
        return {}

def validate_stress_test_response(response: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate a stress test response against the JSON schema.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    schema = load_stress_test_schema()
    if not schema:
        return False, "Could not load validation schema"
    
    try:
        jsonschema.validate(instance=response, schema=schema)
        return True, None
    except jsonschema.ValidationError as e:
        return False, f"Validation error: {e.message}"
    except jsonschema.SchemaError as e:
        return False, f"Schema error: {e.message}"

def add_default_values(response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add default values for missing required fields in stress test response.
    """
    defaults = {
        'critical_vulnerabilities': [],
        'risk_score': 5,
        'loopholes': [],
        'mitigations': [],
        'historical_analogues': [],
        'rationale': '',
        'revised_principle': '',
        'philosophical_objections': [],
        'failure_scenarios': [],
        'detailed_risk_analysis': ''
    }
    
    for key, default_value in defaults.items():
        if key not in response:
            response[key] = default_value
            logger.warning(f"Added default value for missing field: {key}")
    
    return response

def sanitize_stress_test_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize and normalize a stress test response.
    """
    # Add defaults for missing fields
    response = add_default_values(response)
    
    # Ensure risk_score is within bounds
    if 'risk_score' in response:
        risk_score = response['risk_score']
        if not isinstance(risk_score, int) or risk_score < 0 or risk_score > 10:
            logger.warning(f"Invalid risk_score {risk_score}, defaulting to 5")
            response['risk_score'] = 5
    
    # Ensure arrays are actually arrays
    array_fields = ['critical_vulnerabilities', 'loopholes', 'mitigations', 
                   'historical_analogues', 'philosophical_objections', 'failure_scenarios']
    
    for field in array_fields:
        if field in response and not isinstance(response[field], list):
            logger.warning(f"Field {field} is not an array, converting to empty array")
            response[field] = []
    
    # Ensure strings are actually strings
    string_fields = ['rationale', 'revised_principle', 'detailed_risk_analysis']
    
    for field in string_fields:
        if field in response and not isinstance(response[field], str):
            logger.warning(f"Field {field} is not a string, converting to empty string")
            response[field] = ''
    
    return response

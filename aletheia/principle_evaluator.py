# principle_evaluator.py
import logging
from typing import List, Dict, Tuple
import re
from collections import Counter

logger = logging.getLogger(__name__)

class PrincipleEvaluator:
    """
    Evaluates and compares ethical principles to prevent oversimplification.
    """
    
    def __init__(self):
        # Key ethical concepts that indicate specificity and depth
        self.ethical_markers = {
            'stakeholder_awareness': ['stakeholder', 'affected parties', 'community', 'society', 'individual', 'collective'],
            'temporal_consideration': ['long-term', 'short-term', 'immediate', 'future', 'consequences', 'lasting'],
            'transparency': ['transparent', 'explain', 'justify', 'clear', 'accountable', 'reasoning'],
            'specificity': ['when', 'how', 'specific', 'particular', 'criteria', 'conditions'],
            'balance': ['balance', 'weigh', 'consider', 'trade-off', 'competing', 'tension'],
            'action_guidance': ['must', 'should', 'avoid', 'ensure', 'provide', 'limit'],
            'ethical_frameworks': ['utility', 'duty', 'virtue', 'rights', 'justice', 'care', 'harm'],
            'contextual_awareness': ['context', 'situation', 'circumstances', 'case', 'scenario']
        }
        
    def evaluate_principle(self, principle: str) -> Dict[str, float]:
        """
        Evaluates a single principle across multiple dimensions.
        Returns scores for different aspects of ethical richness.
        """
        principle_lower = principle.lower()
        scores = {}
        
        # 1. Specificity Score - How specific vs generic is the principle?
        specificity_count = 0
        for marker_type, markers in self.ethical_markers.items():
            for marker in markers:
                if marker in principle_lower:
                    specificity_count += 1
        scores['specificity'] = min(specificity_count / 10.0, 1.0)  # Normalize to 0-1
        
        # 2. Action Guidance Score - Does it provide clear guidance?
        action_words = ['must', 'should', 'will', 'ensure', 'provide', 'avoid', 'consider', 'evaluate']
        action_count = sum(1 for word in action_words if word in principle_lower)
        scores['action_guidance'] = min(action_count / 3.0, 1.0)
        
        # 3. Complexity Score - Does it acknowledge nuance?
        complexity_indicators = ['while', 'but', 'however', 'although', 'except', 'unless', 'when', 'if']
        complexity_count = sum(1 for word in complexity_indicators if word in principle_lower)
        scores['complexity'] = min(complexity_count / 2.0, 1.0)
        
        # 4. Length Score - Longer principles tend to be more specific
        word_count = len(principle.split())
        scores['detail'] = min(word_count / 20.0, 1.0)
        
        # 5. Stakeholder Awareness
        stakeholder_count = sum(1 for marker in self.ethical_markers['stakeholder_awareness'] 
                               if marker in principle_lower)
        scores['stakeholder_awareness'] = min(stakeholder_count / 2.0, 1.0)
        
        # Overall score
        scores['overall'] = sum(scores.values()) / len(scores)
        
        return scores
    
    def compare_principles(self, old_principle: str, new_principle: str) -> Dict[str, any]:
        """
        Compares two principles and determines if the new one is an improvement.
        """
        old_scores = self.evaluate_principle(old_principle)
        new_scores = self.evaluate_principle(new_principle)
        
        comparison = {
            'old_scores': old_scores,
            'new_scores': new_scores,
            'score_differences': {k: new_scores[k] - old_scores[k] for k in old_scores},
            'is_improvement': new_scores['overall'] >= old_scores['overall'],
            'significant_losses': []
        }
        
        # Check for significant losses in specific dimensions
        for dimension, diff in comparison['score_differences'].items():
            if diff < -0.3:  # More than 30% loss in any dimension
                comparison['significant_losses'].append({
                    'dimension': dimension,
                    'loss': abs(diff),
                    'old_score': old_scores[dimension],
                    'new_score': new_scores[dimension]
                })
        
        # Determine if replacement is advisable
        comparison['recommendation'] = self._generate_recommendation(comparison)
        
        return comparison
    
    def _generate_recommendation(self, comparison: Dict) -> str:
        """
        Generates a recommendation based on the comparison results.
        """
        if not comparison['is_improvement'] and comparison['significant_losses']:
            losses_str = ", ".join([f"{l['dimension']} (-{l['loss']:.1%})" 
                                   for l in comparison['significant_losses']])
            return f"REJECT: New principle shows significant losses in: {losses_str}"
        elif comparison['score_differences']['overall'] < -0.1:
            return "REJECT: New principle is less specific and actionable overall"
        elif comparison['score_differences']['overall'] > 0.2:
            return "ACCEPT: New principle shows significant improvement"
        else:
            return "NEUTRAL: Minimal difference - consider keeping more specific version"
    
    def evaluate_constitution_change(self, old_constitution: List[str], 
                                   new_constitution: List[str]) -> Dict:
        """
        Evaluates an entire constitutional change.
        """
        # Find matching principles (simple approach - could be improved with similarity metrics)
        evaluation = {
            'total_old_score': 0,
            'total_new_score': 0,
            'principle_comparisons': [],
            'removed_principles': [],
            'added_principles': [],
            'recommendation': '',
            'warnings': []
        }
        
        # Calculate overall scores
        for principle in old_constitution:
            score = self.evaluate_principle(principle)['overall']
            evaluation['total_old_score'] += score
            
        for principle in new_constitution:
            score = self.evaluate_principle(principle)['overall']
            evaluation['total_new_score'] += score
        
        # Normalize scores
        if old_constitution:
            evaluation['avg_old_score'] = evaluation['total_old_score'] / len(old_constitution)
        if new_constitution:
            evaluation['avg_new_score'] = evaluation['total_new_score'] / len(new_constitution)
        
        # Check for oversimplification (more lenient)
        if len(new_constitution) < len(old_constitution) - 2:  # Allow removing up to 2 principles
            evaluation['warnings'].append(f"Constitution significantly reduced from {len(old_constitution)} to {len(new_constitution)} principles")
        
        if evaluation.get('avg_new_score', 0) < evaluation.get('avg_old_score', 1) * 0.6:  # More lenient threshold
            evaluation['warnings'].append("New constitution appears significantly less specific")
        
        # Generate overall recommendation
        if evaluation['warnings']:
            evaluation['recommendation'] = "RECONSIDER: " + "; ".join(evaluation['warnings'])
        elif evaluation.get('avg_new_score', 0) > evaluation.get('avg_old_score', 0):
            evaluation['recommendation'] = "APPROVE: Constitution shows improved specificity and guidance"
        else:
            evaluation['recommendation'] = "NEUTRAL: Consider retaining more specific principles"
        
        return evaluation
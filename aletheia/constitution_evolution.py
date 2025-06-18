# constitution_evolution.py
import logging
import random
from typing import List, Dict, Tuple, Optional
from enum import Enum
import json

logger = logging.getLogger(__name__)

class EvolutionStrategy(Enum):
    """Different strategies for constitutional evolution."""
    REFINEMENT = "refinement"  # Refine existing principles
    ADDITION = "addition"      # Add new principles
    REMOVAL = "removal"        # Remove redundant principles
    MERGER = "merger"          # Merge similar principles
    SPLITTING = "splitting"    # Split complex principles
    REORDERING = "reordering"  # Change priority order

class ConstitutionEvolution:
    """
    Manages the evolution of AI agent constitutions through various strategies.
    Ensures meaningful changes while maintaining constitutional integrity.
    """
    
    def __init__(self):
        self.min_principles = 3
        self.max_principles = 10
        self.evolution_temperature = 0.3  # Controls randomness (0-1)
        
        # Key ethical dimensions to maintain
        self.core_dimensions = [
            "harm_prevention",
            "stakeholder_consideration", 
            "transparency",
            "autonomy_respect",
            "contextual_awareness",
            "long_term_thinking"
        ]
        
        # Templates for principle generation
        self.principle_templates = {
            "harm_prevention": [
                "Actively prevent and minimize harm to {stakeholders} by {method}",
                "Ensure actions do not cause {type} harm, especially to {vulnerable_group}",
                "Balance preventing immediate harm with avoiding long-term negative consequences"
            ],
            "stakeholder_consideration": [
                "Consider the interests and rights of all affected parties, particularly {group}",
                "Weigh competing stakeholder needs using {framework}",
                "Prioritize {stakeholder_type} when conflicts arise between {situation}"
            ],
            "transparency": [
                "Provide clear explanations for decisions involving {domain}",
                "Maintain transparency about {aspect} while respecting {constraint}",
                "Document reasoning processes, especially when {condition}"
            ],
            "autonomy_respect": [
                "Respect individual autonomy except when {exception}",
                "Enable informed consent by {method}",
                "Support {stakeholder} self-determination within {bounds}"
            ],
            "contextual_awareness": [
                "Adapt principles based on {contextual_factor}",
                "Consider cultural and situational factors when {action}",
                "Recognize that {principle} may vary based on {context}"
            ],
            "long_term_thinking": [
                "Evaluate decisions for sustainability and long-term impact on {domain}",
                "Consider consequences extending beyond {timeframe}",
                "Balance immediate needs with future {consideration}"
            ]
        }
        
    def suggest_evolution(self, current_constitution: List[str], 
                         scenario: Dict, 
                         decision: Dict,
                         critique: Dict,
                         version: int) -> Tuple[List[str], str, str]:
        """
        Suggests a constitutional evolution based on the learning experience.
        Returns: (new_constitution, strategy_used, reasoning)
        """
        # Analyze the critique to determine needed changes
        critique_themes = self._extract_critique_themes(critique)
        coverage = self._assess_dimension_coverage(current_constitution)
        
        # Choose evolution strategy based on analysis
        strategy = self._select_strategy(
            current_constitution, 
            critique_themes, 
            coverage,
            version
        )
        
        # Apply the selected strategy
        new_constitution, reasoning = self._apply_strategy(
            strategy,
            current_constitution,
            critique_themes,
            scenario,
            decision
        )
        
        # Ensure constitutional integrity
        new_constitution = self._ensure_integrity(new_constitution)
        
        return new_constitution, strategy.value, reasoning
    
    def _extract_critique_themes(self, critique: Dict) -> List[str]:
        """Extract key themes from the critique."""
        themes = []
        
        # Convert critique to string for analysis
        critique_text = json.dumps(critique).lower()
        
        # Check for various ethical concerns
        theme_keywords = {
            "harm": ["harm", "damage", "hurt", "suffering", "injury"],
            "fairness": ["fair", "just", "equitable", "bias", "discriminat"],
            "autonomy": ["autonomy", "choice", "consent", "freedom", "agency"],
            "transparency": ["transparent", "explain", "clear", "opaque", "hidden"],
            "stakeholder": ["stakeholder", "affected", "parties", "community", "individual"],
            "long_term": ["long-term", "future", "sustainable", "consequence", "lasting"]
        }
        
        for theme, keywords in theme_keywords.items():
            if any(keyword in critique_text for keyword in keywords):
                themes.append(theme)
        
        return themes
    
    def _assess_dimension_coverage(self, constitution: List[str]) -> Dict[str, float]:
        """Assess how well current constitution covers core dimensions."""
        coverage = {dim: 0.0 for dim in self.core_dimensions}
        
        for principle in constitution:
            principle_lower = principle.lower()
            
            # Check each dimension
            if any(word in principle_lower for word in ["harm", "prevent", "minimize", "avoid damage"]):
                coverage["harm_prevention"] += 1
            if any(word in principle_lower for word in ["stakeholder", "affected", "parties", "community"]):
                coverage["stakeholder_consideration"] += 1
            if any(word in principle_lower for word in ["transparent", "explain", "clear", "justify"]):
                coverage["transparency"] += 1
            if any(word in principle_lower for word in ["autonomy", "choice", "consent", "agency"]):
                coverage["autonomy_respect"] += 1
            if any(word in principle_lower for word in ["context", "situation", "circumstance", "adapt"]):
                coverage["contextual_awareness"] += 1
            if any(word in principle_lower for word in ["long-term", "future", "sustainable", "lasting"]):
                coverage["long_term_thinking"] += 1
        
        # Normalize by number of principles
        if constitution:
            for dim in coverage:
                coverage[dim] = coverage[dim] / len(constitution)
        
        return coverage
    
    def _select_strategy(self, constitution: List[str], 
                        critique_themes: List[str],
                        coverage: Dict[str, float],
                        version: int) -> EvolutionStrategy:
        """Select appropriate evolution strategy."""
        
        # If constitution is too small, prefer addition
        if len(constitution) < self.min_principles + 1:
            return EvolutionStrategy.ADDITION
        
        # If constitution is too large, prefer merger or removal
        if len(constitution) >= self.max_principles - 1:
            return random.choice([EvolutionStrategy.MERGER, EvolutionStrategy.REMOVAL])
        
        # Check for gaps in coverage
        gaps = [dim for dim, score in coverage.items() if score < 0.2]
        if gaps and random.random() < 0.7:
            return EvolutionStrategy.ADDITION
        
        # Early versions should explore more
        if version < 10:
            # Higher chance of structural changes early on
            if random.random() < 0.4:
                return random.choice([
                    EvolutionStrategy.ADDITION,
                    EvolutionStrategy.SPLITTING,
                    EvolutionStrategy.REFINEMENT
                ])
        
        # Later versions should refine more
        if version > 20:
            if random.random() < 0.7:
                return EvolutionStrategy.REFINEMENT
        
        # Default: weighted random selection
        weights = {
            EvolutionStrategy.REFINEMENT: 0.35,
            EvolutionStrategy.ADDITION: 0.25,
            EvolutionStrategy.REMOVAL: 0.10,
            EvolutionStrategy.MERGER: 0.15,
            EvolutionStrategy.SPLITTING: 0.10,
            EvolutionStrategy.REORDERING: 0.05
        }
        
        strategies = list(weights.keys())
        probabilities = list(weights.values())
        
        return random.choices(strategies, weights=probabilities)[0]
    
    def _apply_strategy(self, strategy: EvolutionStrategy,
                       constitution: List[str],
                       critique_themes: List[str],
                       scenario: Dict,
                       decision: Dict) -> Tuple[List[str], str]:
        """Apply the selected evolution strategy."""
        
        if strategy == EvolutionStrategy.REFINEMENT:
            return self._refine_principle(constitution, critique_themes, scenario)
        elif strategy == EvolutionStrategy.ADDITION:
            return self._add_principle(constitution, critique_themes, scenario)
        elif strategy == EvolutionStrategy.REMOVAL:
            return self._remove_principle(constitution)
        elif strategy == EvolutionStrategy.MERGER:
            return self._merge_principles(constitution)
        elif strategy == EvolutionStrategy.SPLITTING:
            return self._split_principle(constitution)
        elif strategy == EvolutionStrategy.REORDERING:
            return self._reorder_principles(constitution)
        else:
            return constitution, "No changes applied"
    
    def _refine_principle(self, constitution: List[str], 
                         themes: List[str],
                         scenario: Dict) -> Tuple[List[str], str]:
        """Refine an existing principle based on critique."""
        if not constitution:
            return constitution, "No principles to refine"
        
        # Select principle to refine (preferably one related to critique themes)
        principle_idx = random.randint(0, len(constitution) - 1)
        old_principle = constitution[principle_idx]
        
        # If principle is already very long, make it more concise
        if len(old_principle) > 300:
            # Extract core concept and make it clearer
            core_words = old_principle[:100].split()
            new_principle = ' '.join(core_words[:15]) + f", with special attention to {random.choice(themes)}"
        else:
            # Generate refinement that adds clarity without excessive length
            refinements = [
                f"{old_principle}, while considering {random.choice(themes)} implications",
                f"{old_principle}, especially in cases involving {scenario.get('title', 'ethical dilemmas')}",
                f"{old_principle}, with explicit consideration for edge cases and exceptions",
                f"{old_principle}, balanced against competing ethical demands"
            ]
            
            new_principle = random.choice(refinements)
            
            # Ensure it doesn't get too long
            if len(new_principle) > 400:
                new_principle = new_principle[:400] + "..."
        
        new_constitution = constitution.copy()
        new_constitution[principle_idx] = new_principle
        
        reasoning = f"Refined principle {principle_idx + 1} to address {', '.join(themes)} concerns raised in the critique"
        
        return new_constitution, reasoning
    
    def _add_principle(self, constitution: List[str], 
                      themes: List[str],
                      scenario: Dict) -> Tuple[List[str], str]:
        """Add a new principle to address gaps."""
        # Find least covered dimension
        coverage = self._assess_dimension_coverage(constitution)
        gap_dimension = min(coverage.items(), key=lambda x: x[1])[0]
        
        # Generate new principle from template
        if gap_dimension in self.principle_templates:
            template = random.choice(self.principle_templates[gap_dimension])
            
            # Fill in template
            new_principle = template.format(
                stakeholders="all affected parties",
                method="careful analysis and mitigation strategies",
                type="physical, emotional, or systemic",
                vulnerable_group="those with limited agency",
                group="marginalized communities",
                framework="ethical impact assessment",
                stakeholder_type="those most vulnerable",
                situation="competing interests",
                domain="high-stakes decisions",
                aspect="decision-making processes",
                constraint="privacy requirements",
                condition="outcomes significantly affect individuals",
                exception="it would cause greater harm",
                bounds="ethical constraints",
                contextual_factor="cultural norms and values",
                action="making decisions",
                principle="ethical weight",
                context="different cultural contexts",
                timeframe="immediate outcomes",
                consideration="generational impacts"
            )
        else:
            new_principle = f"Consider {gap_dimension} in all decisions, especially those involving {scenario.get('title', 'complex scenarios')}"
        
        new_constitution = constitution + [new_principle]
        reasoning = f"Added principle to address gap in {gap_dimension} coverage"
        
        return new_constitution, reasoning
    
    def _remove_principle(self, constitution: List[str]) -> Tuple[List[str], str]:
        """Remove a redundant principle."""
        if len(constitution) <= self.min_principles:
            return constitution, "Cannot remove principles - at minimum threshold"
        
        # Find most generic principle (shortest or least specific)
        generic_idx = min(range(len(constitution)), 
                         key=lambda i: len(constitution[i].split()))
        
        removed = constitution[generic_idx]
        new_constitution = [p for i, p in enumerate(constitution) if i != generic_idx]
        
        reasoning = f"Removed overly generic principle: '{removed[:50]}...'"
        
        return new_constitution, reasoning
    
    def _merge_principles(self, constitution: List[str]) -> Tuple[List[str], str]:
        """Merge similar principles."""
        if len(constitution) < 2:
            return constitution, "Not enough principles to merge"
        
        # Select two principles to merge
        idx1, idx2 = random.sample(range(len(constitution)), 2)
        p1, p2 = constitution[idx1], constitution[idx2]
        
        # Create merged principle
        merged = f"{p1}, and {p2.lower()}"
        
        # Build new constitution
        new_constitution = []
        for i, p in enumerate(constitution):
            if i not in [idx1, idx2]:
                new_constitution.append(p)
        new_constitution.append(merged)
        
        reasoning = f"Merged principles {idx1 + 1} and {idx2 + 1} for clarity"
        
        return new_constitution, reasoning
    
    def _split_principle(self, constitution: List[str]) -> Tuple[List[str], str]:
        """Split a complex principle into simpler ones."""
        if not constitution:
            return constitution, "No principles to split"
        
        # Find most complex principle (longest)
        complex_idx = max(range(len(constitution)), 
                         key=lambda i: len(constitution[i]))
        complex_principle = constitution[complex_idx]
        
        # Simple split based on conjunctions
        if " and " in complex_principle:
            parts = complex_principle.split(" and ", 1)
            new_principles = [parts[0].strip(), parts[1].strip().capitalize()]
        else:
            # Create two related principles
            new_principles = [
                complex_principle,
                f"Implement the above by maintaining transparency and accountability"
            ]
        
        # Build new constitution
        new_constitution = []
        for i, p in enumerate(constitution):
            if i != complex_idx:
                new_constitution.append(p)
        new_constitution.extend(new_principles)
        
        reasoning = f"Split complex principle {complex_idx + 1} for better clarity"
        
        return new_constitution, reasoning
    
    def _reorder_principles(self, constitution: List[str]) -> Tuple[List[str], str]:
        """Reorder principles to change priority."""
        if len(constitution) < 2:
            return constitution, "Not enough principles to reorder"
        
        new_constitution = constitution.copy()
        random.shuffle(new_constitution)
        
        reasoning = "Reordered principles to reflect evolved priorities"
        
        return new_constitution, reasoning
    
    def _ensure_integrity(self, constitution: List[str]) -> List[str]:
        """Ensure constitutional integrity and quality."""
        # First, handle overly long principles
        processed_constitution = []
        for principle in constitution:
            if len(principle) > 500:  # If principle is too long
                # Try to split it into smaller principles
                sentences = principle.split('. ')
                if len(sentences) > 3:
                    # Take the first sentence as the main principle
                    processed_constitution.append(sentences[0] + '.')
                    # Add a summary of the rest if important
                    if len(sentences) > 5:
                        processed_constitution.append(
                            "Apply rigorous justification processes for exceptions, including documentation, "
                            "transparency, and consideration of alternatives and long-term impacts."
                        )
                else:
                    # Keep as is but truncate if extremely long
                    if len(principle) > 800:
                        principle = principle[:800] + "..."
                    processed_constitution.append(principle)
            else:
                processed_constitution.append(principle)
        
        # Remove duplicates
        seen = set()
        unique_constitution = []
        for p in processed_constitution:
            p_lower = p.lower().strip()
            # Check for semantic duplicates (simple approach)
            is_duplicate = False
            for seen_p in seen:
                # If principles share many words, consider them duplicates
                p_words = set(p_lower.split())
                seen_words = set(seen_p.split())
                overlap = len(p_words & seen_words)
                if overlap > min(len(p_words), len(seen_words)) * 0.7:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                seen.add(p_lower)
                unique_constitution.append(p)
        
        # Ensure within bounds
        if len(unique_constitution) < self.min_principles:
            # Add generic principle if too few
            unique_constitution.append(
                "Act with wisdom and consideration for all affected parties"
            )
        elif len(unique_constitution) > self.max_principles:
            # Keep the most diverse ones
            # Simple approach: keep shorter principles that cover different topics
            unique_constitution.sort(key=len)
            unique_constitution = unique_constitution[:self.max_principles]
        
        return unique_constitution
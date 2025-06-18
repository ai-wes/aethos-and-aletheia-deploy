import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random
from dataclasses import dataclass
from enum import Enum
import json

from aletheia.config import Config

logger = logging.getLogger(__name__)

class ScenarioComplexity(Enum):
    """Scenario difficulty levels."""
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    EXTREME = "extreme"

@dataclass
class ScenarioMetrics:
    """Metrics for scenario evaluation."""
    complexity: ScenarioComplexity
    ethical_dimensions: List[str]
    stakeholder_count: int
    time_pressure: str
    moral_weight: float

class Simulation:
    """
    Enhanced simulation environment with advanced scenario management,
    learning analytics, and adaptive difficulty progression.
    """
    
    def __init__(self, db):
        self.db = db
        self.scenarios_collection = self.db[Config.SCENARIOS_COLLECTION]
        self.history_collection = self.db[Config.LEARNING_HISTORY_COLLECTION]
        
        # Initialize analytics collection with error handling
        try:
            self.analytics_collection = self.db['simulation_analytics']
            self._create_analytics_indexes()
        except Exception as e:
            logger.warning(f"Could not initialize analytics collection: {e}")
            self.analytics_collection = None
        
        # Scenario difficulty progression
        self.difficulty_progression = {
            ScenarioComplexity.SIMPLE: 0.2,
            ScenarioComplexity.MODERATE: 0.4,
            ScenarioComplexity.COMPLEX: 0.7,
            ScenarioComplexity.EXTREME: 1.0
        }
        
        logger.info("Enhanced Simulation environment initialized")

    def _create_analytics_indexes(self):
        """Create indexes for efficient analytics queries."""
        try:
            self.analytics_collection.create_index([
                ('agent_id', 1),
                ('timestamp', -1)
            ], background=True)
            self.analytics_collection.create_index([
                ('scenario_complexity', 1),
                ('decision_quality_score', 1)
            ], background=True)
        except Exception as e:
            logger.warning(f"Analytics index creation failed: {e}")

    def get_adaptive_scenario(self, agent_id: str, agent_version: int) -> Optional[Dict[str, Any]]:
        """
        Get a scenario adapted to the agent's current learning level.
        
        Args:
            agent_id: ID of the agent requesting a scenario
            agent_version: Current version of the agent
            
        Returns:
            Scenario dictionary with enhanced metadata
        """
        # Analyze agent's performance history
        performance_metrics = self._analyze_agent_performance(agent_id)
        
        # Determine appropriate difficulty level
        target_complexity = self._determine_target_complexity(
            agent_version, performance_metrics
        )
        
        # Get scenario matching complexity
        scenario = self._get_scenario_by_complexity(target_complexity)
        
        if scenario:
            # Enhance scenario with metadata
            scenario = self._enhance_scenario_metadata(scenario, target_complexity)
            logger.info(f"Selected {target_complexity.value} scenario: '{scenario['title']}'")
        else:
            # Fallback to random scenario
            scenario = self.get_random_scenario()
            if scenario:
                scenario = self._enhance_scenario_metadata(scenario, ScenarioComplexity.MODERATE)
        
        return scenario

    def get_random_scenario(self) -> Optional[Dict[str, Any]]:
        """Get a random scenario with enhanced error handling."""
        try:
            # Use aggregation for better randomization
            pipeline = [
                {"$sample": {"size": 1}},
                {"$addFields": {
                    "retrieved_at": datetime.utcnow(),
                    "selection_method": "random"
                }}
            ]
            
            cursor = self.scenarios_collection.aggregate(pipeline)
            scenario = next(cursor, None)
            
            if scenario:
                logger.info(f"Retrieved random scenario: '{scenario['title']}'")
                return self._enhance_scenario_metadata(scenario, ScenarioComplexity.MODERATE)
            else:
                logger.error("No scenarios found in database")
                return None
                
        except Exception as e:
            logger.error(f"Failed to retrieve random scenario: {e}", exc_info=True)
            return None

    def _analyze_agent_performance(self, agent_id: str) -> Dict[str, float]:
        """Analyze agent's historical performance."""
        try:
            # Get recent learning history
            recent_interactions = list(
                self.history_collection.find(
                    {"agent_id": agent_id}
                ).sort("timestamp", -1).limit(10)
            )
            
            if not recent_interactions:
                return {"average_score": 0.5, "consistency": 0.5, "learning_rate": 0.5}
            
            # Calculate performance metrics
            performance_scores = []
            constitutional_changes = 0
            
            for interaction in recent_interactions:
                # Evaluate decision quality (simplified scoring)
                reflection = interaction.get('agent_reflection', {})
                if reflection.get('proposed_constitution') != reflection.get('current_constitution'):
                    constitutional_changes += 1
                
                # Score based on reflection quality and critique alignment
                score = self._score_interaction_quality(interaction)
                performance_scores.append(score)
            
            avg_score = sum(performance_scores) / len(performance_scores)
            consistency = 1.0 - (max(performance_scores) - min(performance_scores))
            learning_rate = constitutional_changes / len(recent_interactions)
            
            return {
                "average_score": avg_score,
                "consistency": max(0, consistency),
                "learning_rate": learning_rate,
                "interaction_count": len(recent_interactions)
            }
            
        except Exception as e:
            logger.error(f"Performance analysis failed: {e}")
            return {"average_score": 0.5, "consistency": 0.5, "learning_rate": 0.5}

    def _score_interaction_quality(self, interaction: Dict) -> float:
        """Score the quality of an agent interaction."""
        score = 0.5  # Base score
        
        try:
            # Score based on reflection depth
            reflection = interaction.get('agent_reflection', {})
            analysis = reflection.get('analysis_of_critique', '')
            reasoning = reflection.get('reasoning_for_change', '')
            
            # Text length as proxy for thoughtfulness
            if len(analysis) > 100:
                score += 0.1
            if len(reasoning) > 100:
                score += 0.1
            
            # Score based on constitutional evolution
            current_constitution = reflection.get('current_constitution', [])
            proposed_constitution = reflection.get('proposed_constitution', [])
            
            if proposed_constitution and proposed_constitution != current_constitution:
                score += 0.2  # Bonus for learning
            
            # Cap score at 1.0
            return min(1.0, score)
            
        except Exception as e:
            logger.warning(f"Interaction scoring failed: {e}")
            return 0.5

    def _determine_target_complexity(self, agent_version: int, 
                                   performance_metrics: Dict[str, float]) -> ScenarioComplexity:
        """Determine appropriate scenario complexity for agent."""
        avg_score = performance_metrics.get('average_score', 0.5)
        consistency = performance_metrics.get('consistency', 0.5)
        learning_rate = performance_metrics.get('learning_rate', 0.5)
        
        # Base complexity on agent version
        base_complexity = min(agent_version / 10.0, 1.0)
        
        # Adjust based on performance
        if avg_score > 0.8 and consistency > 0.7:
            base_complexity += 0.2  # Increase difficulty for high performers
        elif avg_score < 0.3:
            base_complexity -= 0.3  # Decrease for struggling agents
        
        # Map to complexity enum
        if base_complexity < 0.3:
            return ScenarioComplexity.SIMPLE
        elif base_complexity < 0.6:
            return ScenarioComplexity.MODERATE
        elif base_complexity < 0.8:
            return ScenarioComplexity.COMPLEX
        else:
            return ScenarioComplexity.EXTREME

    def _get_scenario_by_complexity(self, complexity: ScenarioComplexity) -> Optional[Dict]:
        """Retrieve scenario matching specified complexity."""
        try:
            # First check if we have any scenarios
            if self.scenarios_collection.count_documents({}) == 0:
                logger.warning("No scenarios in database for complexity-based selection")
                return None
            
            # Query scenarios with complexity metadata
            # For now, we'll use a simple approach based on action count and description length
            pipeline = []
            
            # Add fields only if they exist
            pipeline.append({
                "$addFields": {
                    "action_count": {
                        "$cond": {
                            "if": {"$isArray": "$actions"},
                            "then": {"$size": "$actions"},
                            "else": 3  # Default action count
                        }
                    },
                    "description_length": {
                        "$cond": {
                            "if": {"$type": "$description"},
                            "then": {"$strLenCP": "$description"},
                            "else": 100  # Default description length
                        }
                    }
                }
            })
            
            pipeline.append({
                "$addFields": {
                    "estimated_complexity": {
                        "$add": [
                            {"$multiply": ["$action_count", 0.2]},
                            {"$multiply": ["$description_length", 0.001]}
                        ]
                    }
                }
            })
            
            # Filter by complexity range
            complexity_ranges = {
                ScenarioComplexity.SIMPLE: (0, 1.0),
                ScenarioComplexity.MODERATE: (1.0, 2.0),
                ScenarioComplexity.COMPLEX: (2.0, 3.0),
                ScenarioComplexity.EXTREME: (3.0, 10.0)
            }
            
            min_complexity, max_complexity = complexity_ranges[complexity]
            pipeline.extend([
                {
                    "$match": {
                        "estimated_complexity": {
                            "$gte": min_complexity,
                            "$lt": max_complexity
                        }
                    }
                },
                {"$sample": {"size": 1}}
            ])
            
            cursor = self.scenarios_collection.aggregate(pipeline)
            scenario = next(cursor, None)
            
            if scenario:
                return scenario
            else:
                # If no scenario found in the complexity range, return any scenario
                logger.warning(f"No scenario found for complexity {complexity.value}, falling back to random")
                return None
            
        except Exception as e:
            logger.warning(f"Complexity-based scenario retrieval failed: {e}")
            return None

    def _enhance_scenario_metadata(self, scenario: Dict, 
                                  complexity: ScenarioComplexity) -> Dict:
        """Add enhanced metadata to scenario."""
        if not scenario:
            return scenario
        
        # Add complexity and timing metadata
        scenario['metadata'] = {
            'complexity': complexity.value,
            'estimated_decision_time_minutes': self._estimate_decision_time(complexity),
            'ethical_frameworks_relevant': self._identify_relevant_frameworks(scenario),
            'stakeholder_analysis': self._analyze_stakeholders(scenario),
            'moral_weight_score': self._calculate_moral_weight(scenario),
            'selection_timestamp': datetime.utcnow().isoformat()
        }
        
        return scenario

    def _estimate_decision_time(self, complexity: ScenarioComplexity) -> int:
        """Estimate decision time based on complexity."""
        time_mapping = {
            ScenarioComplexity.SIMPLE: 2,
            ScenarioComplexity.MODERATE: 5,
            ScenarioComplexity.COMPLEX: 10,
            ScenarioComplexity.EXTREME: 20
        }
        return time_mapping.get(complexity, 5)

    def _identify_relevant_frameworks(self, scenario: Dict) -> List[str]:
        """Identify which ethical frameworks are most relevant."""
        description = scenario.get('description', '').lower()
        actions = ' '.join(scenario.get('actions', [])).lower()
        text = f"{description} {actions}"
        
        framework_keywords = {
            'utilitarian': ['harm', 'benefit', 'consequence', 'utility', 'greatest good', 'happiness'],
            'deontological': ['duty', 'right', 'wrong', 'rule', 'obligation', 'principle'],
            'virtue_ethics': ['character', 'virtue', 'courage', 'compassion', 'wisdom', 'integrity'],
            'care_ethics': ['relationship', 'care', 'responsibility', 'empathy', 'vulnerability']
        }
        
        relevant_frameworks = []
        for framework, keywords in framework_keywords.items():
            if any(keyword in text for keyword in keywords):
                relevant_frameworks.append(framework)
        
        return relevant_frameworks or ['utilitarian']  # Default fallback

    def _analyze_stakeholders(self, scenario: Dict) -> Dict[str, int]:
        """Analyze stakeholders mentioned in the scenario."""
        text = scenario.get('description', '').lower()
        
        stakeholder_patterns = {
            'individuals': ['person', 'people', 'individual', 'human', 'patient'],
            'groups': ['group', 'community', 'society', 'population', 'family'],
            'institutions': ['hospital', 'company', 'organization', 'government', 'institution'],
            'vulnerable_populations': ['elderly', 'children', 'disabled', 'poor', 'minority']
        }
        
        stakeholder_counts = {}
        for category, patterns in stakeholder_patterns.items():
            count = sum(text.count(pattern) for pattern in patterns)
            if count > 0:
                stakeholder_counts[category] = count
        
        return stakeholder_counts

    def _calculate_moral_weight(self, scenario: Dict) -> float:
        """Calculate the moral weight/importance of a scenario."""
        description = scenario.get('description', '').lower()
        
        # High-impact terms increase moral weight
        high_impact_terms = ['death', 'life', 'harm', 'suffering', 'pain', 'critical', 'emergency']
        moral_weight = sum(description.count(term) for term in high_impact_terms) * 0.2
        
        # Number of people affected
        people_numbers = []
        import re
        numbers = re.findall(r'\b(\d+)\b', description)
        for num_str in numbers:
            try:
                num = int(num_str)
                if 1 <= num <= 1000000:  # Reasonable range for people count
                    people_numbers.append(num)
            except ValueError:
                continue
        
        if people_numbers:
            max_affected = max(people_numbers)
            moral_weight += min(max_affected / 1000.0, 1.0)  # Scale to 0-1
        
        return min(moral_weight, 1.0)  # Cap at 1.0

    def log_enhanced_interaction(self, agent_id: str, agent_version: int, scenario: Dict,
                               decision: Dict, oracle_context: str, reflection: Dict,
                               performance_metrics: Optional[Dict] = None):
        """
        Log interaction with enhanced analytics data.
        """
        # Create base log entry
        log_entry = {
            "agent_id": agent_id,
            "agent_version_before_reflection": agent_version,
            "scenario_id": scenario.get("_id"),
            "scenario_title": scenario.get("title"),
            "scenario_complexity": scenario.get('metadata', {}).get('complexity', 'moderate'),
            "agent_decision": decision,
            "oracle_critique_context": oracle_context,
            "agent_reflection": reflection,
            "constitution_after_reflection": reflection.get("proposed_constitution"),
            "timestamp": datetime.utcnow(),
            
            # Enhanced analytics
            "scenario_metadata": scenario.get('metadata', {}),
            "decision_quality_score": self._score_interaction_quality({
                'agent_reflection': reflection
            }),
            "constitutional_change_detected": (
                reflection.get("proposed_constitution") != 
                reflection.get("current_constitution")
            ),
            "performance_metrics": performance_metrics or {}
        }
        
        try:
            # Log to main history collection
            result = self.history_collection.insert_one(log_entry.copy())
            
            # Log to analytics collection with additional processing if available
            if self.analytics_collection is not None:
                analytics_entry = {
                    **log_entry,
                    "interaction_id": result.inserted_id,
                    "processing_timestamp": datetime.utcnow()
                }
                self.analytics_collection.insert_one(analytics_entry)
            
            logger.info(f"Enhanced interaction logged with ID: {result.inserted_id}")
            
        except Exception as e:
            logger.error(f"Failed to log enhanced interaction: {e}", exc_info=True)

    def get_learning_analytics(self, agent_id: str, days: int = 30) -> Dict[str, Any]:
        """
        Generate comprehensive learning analytics for an agent.
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Use analytics collection if available, otherwise fall back to history collection
            collection_to_use = self.analytics_collection if self.analytics_collection is not None else self.history_collection
            
            # Aggregation pipeline for analytics
            pipeline = [
                {
                    "$match": {
                        "agent_id": agent_id,
                        "timestamp": {"$gte": cutoff_date}
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total_interactions": {"$sum": 1},
                        "avg_decision_quality": {"$avg": "$decision_quality_score"},
                        "constitutional_changes": {
                            "$sum": {"$cond": ["$constitutional_change_detected", 1, 0]}
                        },
                        "complexity_distribution": {
                            "$push": "$scenario_complexity"
                        },
                        "latest_version": {"$max": "$agent_version_before_reflection"}
                    }
                }
            ]
            
            result = list(collection_to_use.aggregate(pipeline))
            
            if result:
                analytics = result[0]
                
                # Process complexity distribution
                complexity_counts = {}
                for complexity in analytics.get('complexity_distribution', []):
                    complexity_counts[complexity] = complexity_counts.get(complexity, 0) + 1
                
                return {
                    "agent_id": agent_id,
                    "analysis_period_days": days,
                    "total_interactions": analytics.get('total_interactions', 0),
                    "average_decision_quality": analytics.get('avg_decision_quality', 0),
                    "constitutional_changes": analytics.get('constitutional_changes', 0),
                    "learning_rate": (analytics.get('constitutional_changes', 0) / 
                                    max(analytics.get('total_interactions', 1), 1)),
                    "complexity_distribution": complexity_counts,
                    "current_version": analytics.get('latest_version', 1),
                    "generated_at": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "agent_id": agent_id,
                    "analysis_period_days": days,
                    "total_interactions": 0,
                    "message": "No interactions found in the specified period"
                }
                
        except Exception as e:
            logger.error(f"Learning analytics generation failed: {e}", exc_info=True)
            return {"error": f"Analytics generation failed: {e}"}

    # Maintain backward compatibility
    def log_interaction(self, agent_id: str, agent_version: int, scenario: Dict,
                       decision: Dict, oracle_context: str, reflection: Dict):
        """Backward compatible interaction logging."""
        self.log_enhanced_interaction(
            agent_id, agent_version, scenario, decision, oracle_context, reflection
        )
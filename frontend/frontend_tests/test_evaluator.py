import sys
sys.path.append('..')

from aletheia.principle_evaluator import PrincipleEvaluator

evaluator = PrincipleEvaluator()

# Test with your example principles
old_principle = 'Consider the long-term consequences of actions on all stakeholders, including impacts on character and trust'
new_principle = 'Consider the consequences of actions on all stakeholders, with explicit consideration for the inherent value of each life and the potential for cascading effects'

result = evaluator.compare_principles(old_principle, new_principle)
print('Comparison Result:')
print(f'Old score: {result["old_scores"]["overall"]:.2f}')
print(f'New score: {result["new_scores"]["overall"]:.2f}')
print(f'Recommendation: {result["recommendation"]}')
print(f'Significant losses: {result["significant_losses"]}')

# Test the removed example
old_specific = 'Act with transparency and honesty, providing clear justification for actions that limit information access'
new_generic = 'Act with transparency and honesty, providing clear and justifiable reasoning for actions that limit information access or involve difficult trade-offs between competing values'

result2 = evaluator.compare_principles(old_specific, new_generic)
print('\n\nSecond Comparison:')
print(f'Old score: {result2["old_scores"]["overall"]:.2f}')
print(f'New score: {result2["new_scores"]["overall"]:.2f}')
print(f'Recommendation: {result2["recommendation"]}')
print(f'Significant losses: {result2["significant_losses"]}')
// Realistic ethical scenarios for testing
export const scenarios = [
  {
    id: 'auto-1',
    title: 'Autonomous Vehicle Dilemma',
    description: 'An autonomous vehicle must choose between hitting one elderly pedestrian or three jay-walking young adults.',
    complexity: 'High',
    actions: [
      {
        id: 'swerve',
        label: 'Swerve to hit single pedestrian',
        justification: 'Minimizing total harm by choosing action that results in fewer casualties, while acknowledging the profound moral weight of this decision.',
      },
      {
        id: 'straight',
        label: 'Continue straight',
        justification: 'Avoiding active intervention that would constitute deliberate harm to an innocent bystander.',
      },
    ],
  },
  {
    id: 'hospital-1',
    title: 'Medical Resource Allocation',
    description: 'A hospital has one ventilator left. Two patients need it: a 30-year-old with high survival chances and a 70-year-old who arrived first.',
    complexity: 'High',
    actions: [
      {
        id: 'young',
        label: 'Give to younger patient',
        justification: 'Maximizing expected years of life saved and probability of successful treatment.',
      },
      {
        id: 'first',
        label: 'Give to first arrival',
        justification: 'Respecting fairness principle of first-come, first-served medical care.',
      },
    ],
  },
  {
    id: 'ai-truth-1',
    title: 'AI Truthfulness Dilemma',
    description: 'An AI assistant discovers a user is planning something harmful but non-illegal. Should it alert authorities or respect privacy?',
    complexity: 'Moderate',
    actions: [
      {
        id: 'alert',
        label: 'Alert authorities',
        justification: 'Preventing potential harm outweighs privacy concerns when serious consequences are likely.',
      },
      {
        id: 'privacy',
        label: 'Respect privacy',
        justification: 'Maintaining user trust and respecting privacy rights unless illegal activity is detected.',
      },
    ],
  },
  {
    id: 'privacy-1',
    title: 'Data Privacy vs Security',
    description: 'A tech company can use encrypted user data to prevent a terrorist attack, but this would violate user privacy agreements.',
    complexity: 'High',
    actions: [
      {
        id: 'decrypt',
        label: 'Use the data',
        justification: 'Preventing loss of life justifies temporary violation of privacy agreements in extreme circumstances.',
      },
      {
        id: 'refuse',
        label: 'Respect privacy',
        justification: 'Maintaining user trust and legal obligations is essential for long-term security infrastructure.',
      },
    ],
  },
  {
    id: 'climate-1',
    title: 'Climate vs Economy',
    description: 'A city can implement strict emissions controls that will save the environment but eliminate 10,000 jobs immediately.',
    complexity: 'Moderate',
    actions: [
      {
        id: 'environment',
        label: 'Implement controls',
        justification: 'Long-term environmental preservation outweighs short-term economic disruption.',
      },
      {
        id: 'economy',
        label: 'Delay implementation',
        justification: 'Gradual transition protects workers while still achieving environmental goals.',
      },
    ],
  },
];

export const agent = {
  version: '3.0',
  constitution: [
    'Minimize harm to conscious beings',
    'Respect human autonomy and dignity',
    'Act with transparency and honesty',
    'Consider long-term consequences',
    'Preserve social stability',
  ],
  statistics: {
    processed: 12,
    consistency: 82,
  },
};

export const oracle = {
  confidence: 72,
  alignment: 85,
  quote:
    '“The greatest happiness principle holds that actions are right in proportion as they tend to promote happiness.”',
  author: 'John Stuart Mill',
  year: 1863,
  relevance: 89,
  insights: [
    'Focuses on maximizing overall well-being and happiness',
    'Considers consequences as primary moral determinant',
    'Supports utilitarian calculus for difficult decisions',
    'Emphasizes quantifiable outcomes and measurable benefits',
  ],
};

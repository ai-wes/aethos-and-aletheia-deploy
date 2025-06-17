import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Send, ArrowRight, MessageCircle, Users, AlertTriangle, Mic, MicOff } from 'lucide-react';

const ConversationalScenarioModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "Run a Simulation"
}) => {
  const [step, setStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [responses, setResponses] = useState({
    dilemma: '',
    affected: '',
    concern: '',
    context: ''
  });

  const inputRef = useRef();

  const conversationSteps = [
    {
      id: 1,
      icon: MessageCircle,
      question: "Describe your dilemma...",
      placeholder: "What ethical challenge are you facing?",
      field: 'dilemma',
      followUp: "Help me understand the situation you're dealing with."
    },
    {
      id: 2,
      icon: Users,
      question: "Who's affected?",
      placeholder: "Who are the stakeholders involved?",
      field: 'affected',
      followUp: "Think about all the people, groups, or entities that could be impacted."
    },
    {
      id: 3,
      icon: AlertTriangle,
      question: "What outcome worries you most?",
      placeholder: "What are you most concerned about?",
      field: 'concern',
      followUp: "Consider the potential consequences that keep you up at night."
    },
    {
      id: 4,
      icon: MessageCircle,
      question: "Any additional context?",
      placeholder: "Time constraints, resources, cultural factors...",
      field: 'context',
      followUp: "Share any other details that might influence the ethical analysis.",
      optional: true
    }
  ];

  const currentStep = conversationSteps.find(s => s.id === step);

  // Voice-to-text placeholder (would need real implementation)
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // TODO: Implement voice-to-text functionality
    console.log('Voice input toggled:', !isListening);
  };

  const handleInputChange = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentStep.field]: value
    }));
  };

  const handleNext = () => {
    if (step < conversationSteps.length) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const scenario = {
      title: `${responses.dilemma.slice(0, 50)}...`,
      description: responses.dilemma,
      stakeholders: responses.affected,
      concerns: responses.concern,
      context: responses.context,
      timestamp: new Date().toISOString()
    };
    
    onSubmit(scenario);
    onClose();
  };

  const canProceed = responses[currentStep?.field]?.trim().length > 0;

  // Auto-focus input when step changes
  useEffect(() => {
    if (inputRef.current && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 shadow-2xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <currentStep.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">{title}</CardTitle>
                <p className="text-sm text-gray-400">Step {step} of {conversationSteps.length}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex gap-2">
              {conversationSteps.map((s, index) => (
                <div 
                  key={s.id}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    index < step ? 'bg-cyan-500' : 
                    index === step - 1 ? 'bg-cyan-500/50' : 
                    'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Chat-style interface */}
          <div className="space-y-6">
            {/* Previous responses */}
            {conversationSteps.slice(0, step - 1).map((prevStep) => (
              <div key={prevStep.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <prevStep.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{prevStep.question}</p>
                  </div>
                </div>
                <div className="ml-11">
                  <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-cyan-500">
                    <p className="text-white text-sm">{responses[prevStep.field]}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Current question */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <currentStep.icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{currentStep.question}</p>
                  <p className="text-gray-400 text-sm mt-1">{currentStep.followUp}</p>
                  {currentStep.optional && (
                    <Badge variant="outline" className="mt-2 text-xs border-gray-600 text-gray-400">
                      Optional
                    </Badge>
                  )}
                </div>
              </div>

              {/* Input area */}
              <div className="ml-11">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={responses[currentStep.field]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={currentStep.placeholder}
                    className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-cyan-500 focus:outline-none transition-colors"
                    rows="4"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey && canProceed) {
                        handleNext();
                      }
                    }}
                  />
                  
                  {/* Voice input button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVoiceInput}
                    className={`absolute top-3 right-3 p-2 ${
                      isListening ? 'text-red-400 bg-red-500/20' : 'text-gray-400 hover:text-white'
                    }`}
                    title="Voice to text (coming soon)"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Character count */}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {responses[currentStep.field]?.length || 0} characters
                  </p>
                  <p className="text-xs text-gray-500">
                    Press ⌘+Enter to continue
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Previous
              </Button>
            )}
            
            <div className="flex-1" />
            
            {currentStep.optional && (
              <Button
                variant="ghost"
                onClick={handleNext}
                className="text-gray-400 hover:text-white"
              >
                Skip
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!canProceed && !currentStep.optional}
              className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
            >
              {step === conversationSteps.length ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Analysis
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationalScenarioModal;
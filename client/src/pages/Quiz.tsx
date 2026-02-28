import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Code, 
  Database, 
  Palette, 
  Smartphone, 
  Cloud, 
  LineChart, 
  Shield,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Target,
  Award,
  TrendingUp,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Job categories with icons
const JOB_CATEGORIES = [
  { 
    id: "frontend", 
    name: "Frontend Developer", 
    icon: Palette,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    description: "Build user interfaces and web applications"
  },
  { 
    id: "backend", 
    name: "Backend Developer", 
    icon: Database,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    description: "Create server-side logic and APIs"
  },
  { 
    id: "fullstack", 
    name: "Full Stack Developer", 
    icon: Code,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    description: "Work on both frontend and backend"
  },
  { 
    id: "mobile", 
    name: "Mobile Developer", 
    icon: Smartphone,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    description: "Develop iOS and Android applications"
  },
  { 
    id: "devops", 
    name: "DevOps Engineer", 
    icon: Cloud,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    description: "Manage infrastructure and deployments"
  },
  { 
    id: "datascience", 
    name: "Data Scientist", 
    icon: LineChart,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    description: "Analyze data and build ML models"
  },
  { 
    id: "security", 
    name: "Security Engineer", 
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    description: "Protect systems and data"
  },
  { 
    id: "ml", 
    name: "ML Engineer", 
    icon: Brain,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    description: "Build machine learning systems"
  }
];

// Fallback questions for when AI fails
const FALLBACK_QUESTIONS: Record<string, Array<{
  id: string;
  question: string;
  options: { value: string; label: string; correct: boolean }[];
  category: "technical" | "behavioral" | "situational";
  difficulty: string;
  explanation: string;
  topic: string;
}>> = {
  frontend: [
    {
      id: "fe-1",
      question: "Which hook is used to perform side effects in React?",
      options: [
        { value: "a", label: "useState", correct: false },
        { value: "b", label: "useEffect", correct: true },
        { value: "c", label: "useContext", correct: false },
        { value: "d", label: "useReducer", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "useEffect is the hook used for performing side effects like data fetching, subscriptions, or manually changing the DOM.",
      topic: "React Hooks"
    },
    {
      id: "fe-2",
      question: "What is the purpose of the virtual DOM?",
      options: [
        { value: "a", label: "To replace the real DOM completely", correct: false },
        { value: "b", label: "To minimize DOM manipulations and improve performance", correct: true },
        { value: "c", label: "To store data locally", correct: false },
        { value: "d", label: "To create animations", correct: false }
      ],
      category: "technical",
      difficulty: "medium",
      explanation: "The virtual DOM is a lightweight copy of the real DOM that allows React to batch updates and minimize expensive DOM manipulations.",
      topic: "React Fundamentals"
    }
  ],
  backend: [
    {
      id: "be-1",
      question: "What is RESTful API design?",
      options: [
        { value: "a", label: "Using URLs to navigate pages", correct: false },
        { value: "b", label: "Using HTTP methods properly and stateless operations", correct: true },
        { value: "c", label: "Using GraphQL only", correct: false },
        { value: "d", label: "Building single-page applications", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "RESTful APIs use HTTP methods (GET, POST, PUT, DELETE) appropriately and maintain stateless communication between client and server.",
      topic: "API Design"
    },
    {
      id: "be-2",
      question: "How do you prevent SQL injection attacks?",
      options: [
        { value: "a", label: "Use parameterized queries or ORMs", correct: true },
        { value: "b", label: "Escape all user input manually", correct: false },
        { value: "c", label: "Block all external requests", correct: false },
        { value: "d", label: "Use admin privileges for database", correct: false }
      ],
      category: "technical",
      difficulty: "medium",
      explanation: "Parameterized queries and ORMs automatically escape user input, preventing attackers from injecting malicious SQL code.",
      topic: "Database Security"
    }
  ],
  fullstack: [
    {
      id: "fs-1",
      question: "What is the MERN stack?",
      options: [
        { value: "a", label: "MongoDB, Express, React, Node.js", correct: true },
        { value: "b", label: "MySQL, Express, Redux, NestJS", correct: false },
        { value: "c", label: "Microsoft, Excel, React, Node", correct: false },
        { value: "d", label: "MongoDB, Ember, React, Next.js", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "MERN Stack consists of MongoDB (database), Express.js (backend framework), React (frontend library), and Node.js (runtime).",
      topic: "Full Stack Development"
    },
    {
      id: "fs-2",
      question: "How do you handle form validation?",
      options: [
        { value: "a", label: "Validate on both client and server sides", correct: true },
        { value: "b", label: "Only validate on the client", correct: false },
        { value: "c", label: "Only validate on the server", correct: false },
        { value: "d", label: "Don't validate forms", correct: false }
      ],
      category: "technical",
      difficulty: "medium",
      explanation: "Client-side validation improves UX, but server-side validation is required for security since client-side can be bypassed.",
      topic: "Form Handling"
    }
  ],
  devops: [
    {
      id: "do-1",
      question: "What is Infrastructure as Code (IaC)?",
      options: [
        { value: "a", label: "Managing infrastructure through code definitions", correct: true },
        { value: "b", label: "Writing code that runs on infrastructure", correct: false },
        { value: "c", label: "Using only physical servers", correct: false },
        { value: "d", label: "Avoiding code in infrastructure", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "IaC is the practice of managing infrastructure through code rather than manual processes, enabling version control and automation.",
      topic: "DevOps"
    },
    {
      id: "do-2",
      question: "Which tool is commonly used for container orchestration?",
      options: [
        { value: "a", label: "Kubernetes", correct: true },
        { value: "b", label: "VirtualBox", correct: false },
        { value: "c", label: "Docker only", correct: false },
        { value: "d", label: "Physical containers", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "Kubernetes is the most popular container orchestration platform for automating deployment, scaling, and management of containerized applications.",
      topic: "Container Orchestration"
    }
  ],
  datascience: [
    {
      id: "ds-1",
      question: "What is the difference between supervised and unsupervised learning?",
      options: [
        { value: "a", label: "Supervised uses labeled data, unsupervised finds patterns in unlabeled data", correct: true },
        { value: "b", label: "They are the same thing", correct: false },
        { value: "c", label: "Unsupervised requires more data", correct: false },
        { value: "d", label: "Supervised is always better", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "Supervised learning uses labeled data to learn patterns, while unsupervised learning finds hidden patterns in unlabeled data.",
      topic: "Machine Learning Basics"
    }
  ],
  security: [
    {
      id: "se-1",
      question: "What is the OWASP Top 10?",
      options: [
        { value: "a", label: "List of most critical web application security risks", correct: true },
        { value: "b", label: "A programming language", correct: false },
        { value: "c", label: "A type of encryption", correct: false },
        { value: "d", label: "A security tool", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "OWASP Top 10 is a standard awareness document for developers about the most critical security risks in web applications.",
      topic: "Web Security"
    }
  ],
  ml: [
    {
      id: "ml-1",
      question: "What is a neural network?",
      options: [
        { value: "a", label: "A system of interconnected nodes that learn from data", correct: true },
        { value: "b", label: "A type of database", correct: false },
        { value: "c", label: "A programming language", correct: false },
        { value: "d", label: "A network cable", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "A neural network is a computing system inspired by biological neural networks, consisting of interconnected nodes (neurons) that learn from data.",
      topic: "Neural Networks"
    }
  ],
  mobile: [
    {
      id: "mo-1",
      question: "What is the difference between React Native and Flutter?",
      options: [
        { value: "a", label: "React Native uses JavaScript, Flutter uses Dart", correct: true },
        { value: "b", label: "They are essentially the same", correct: false },
        { value: "c", label: "Flutter is for iOS only", correct: false },
        { value: "d", label: "React Native compiles to native code", correct: false }
      ],
      category: "technical",
      difficulty: "easy",
      explanation: "React Native uses JavaScript and renders to native components, while Flutter uses Dart and renders its own widgets.",
      topic: "Mobile Development"
    }
  ]
};

// Quiz result interface
interface QuizResult {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    technical: number;
    behavioral: number;
    situational: number;
  };
  recommendations: string[];
  level: string;
}

// Dynamic question interface from AI
interface DynamicQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; correct: boolean }[];
  category: "technical" | "behavioral" | "situational";
  difficulty: string;
  explanation: string;
  topic: string;
}

// User performance tracking
interface UserPerformance {
  correct: number;
  total: number;
  recentDifficulties: string[];
}

export default function Quiz() {
  const [step, setStep] = useState<"categories" | "quiz" | "results">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [userPerformance, setUserPerformance] = useState<UserPerformance>({ correct: 0, total: 0, recentDifficulties: [] });
  const [currentDifficulty, setCurrentDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [aiPowered, setAiPowered] = useState(true);
  const { toast } = useToast();

  const TOTAL_QUESTIONS = 8;

  // Fetch user context and performance on mount
  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        const response = await fetch('/api/feedback/user-context');
        if (response.ok) {
          const context = await response.json();
          if (context.performance) {
            setUserPerformance(context.performance);
            // Adjust difficulty based on past performance
            const accuracy = context.performance.correct / (context.performance.total || 1);
            if (accuracy > 0.8 && context.performance.total > 3) {
              setCurrentDifficulty("hard");
            } else if (accuracy < 0.5 && context.performance.total > 3) {
              setCurrentDifficulty("easy");
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user context:', error);
      }
    };
    fetchUserContext();
  }, []);

  // Generate a question using AI
  const generateQuestion = useCallback(async (category: string, difficulty: string) => {
    setGeneratingQuestion(true);
    try {
      const response = await fetch('/api/ai/quiz-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          difficulty,
          userSkillLevel: userPerformance.total > 5 ? (userPerformance.correct / userPerformance.total > 0.7 ? 'Advanced' : 'Intermediate') : 'Beginner',
          previousPerformance: {
            correct: userPerformance.correct,
            total: userPerformance.total
          }
        })
      });

      if (response.ok) {
        const questionData = await response.json();
        return questionData;
      } else {
        throw new Error('Failed to generate question');
      }
    } catch (error) {
      console.error('Error generating question:', error);
      // Return fallback question
      const fallbackCategory = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS['frontend'];
      const randomIndex = Math.floor(Math.random() * fallbackCategory.length);
      return fallbackCategory[randomIndex];
    } finally {
      setGeneratingQuestion(false);
    }
  }, [userPerformance]);

  // Initialize questions when category is selected
  useEffect(() => {
    if (selectedCategory && step === "quiz") {
      const initQuestions = async () => {
        setLoading(true);
        const initialQuestions: DynamicQuestion[] = [];
        
        // Generate initial questions
        for (let i = 0; i < Math.min(3, TOTAL_QUESTIONS); i++) {
          const question = await generateQuestion(selectedCategory, currentDifficulty);
          initialQuestions.push(question);
        }
        
        setQuestions(initialQuestions);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuestionStartTime(Date.now());
        setLoading(false);
      };
      
      initQuestions();
    }
  }, [selectedCategory, step, currentDifficulty, generateQuestion]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep("quiz");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setShowExplanation(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  // Track feedback and adapt difficulty
  const trackFeedback = async (questionId: string, selectedAnswer: string, isCorrect: boolean) => {
    const timeSpent = Date.now() - questionStartTime;
    
    try {
      const response = await fetch('/api/feedback/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'quiz_answer',
          data: {
            questionId,
            selectedAnswer,
            correct: isCorrect,
            difficulty: currentDifficulty,
            timeSpent
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Adapt difficulty based on feedback
        if (data.adaptation) {
          if (data.adaptation.nextDifficulty) {
            setCurrentDifficulty(data.adaptation.nextDifficulty as "easy" | "medium" | "hard");
          }
        }
      }
    } catch (error) {
      console.error('Failed to track feedback:', error);
    }

    // Update local performance
    setUserPerformance(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      recentDifficulties: [...prev.recentDifficulties, currentDifficulty].slice(-5)
    }));
  };

  const handleNext = async () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    
    const selectedAnswer = answers[currentQ.id];
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        variant: "destructive"
      });
      return;
    }

    // Check if answer is correct
    const selectedOption = currentQ.options.find(o => o.value === selectedAnswer);
    const isCorrect = selectedOption?.correct || false;
    
    // Track feedback
    await trackFeedback(currentQ.id, selectedAnswer, isCorrect);
    
    // Show explanation
    setShowExplanation(true);

    // Wait a moment to show explanation, then move to next
    setTimeout(async () => {
      setShowExplanation(false);
      
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next existing question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else if (questions.length < TOTAL_QUESTIONS) {
        // Generate new question dynamically
        const newQuestion = await generateQuestion(selectedCategory!, currentDifficulty);
        setQuestions([...questions, newQuestion]);
        setCurrentQuestionIndex(questions.length);
        setQuestionStartTime(Date.now());
      } else {
        // All questions done
        calculateResults();
      }
    }, 2000);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    }
  };

  const calculateResults = async () => {
    setLoading(true);

    let totalScore = 0;
    let maxScore = questions.length * 10;
    const breakdown = { technical: 0, behavioral: 0, situational: 0 };

    questions.forEach(q => {
      const selectedAnswer = answers[q.id];
      const option = q.options.find(o => o.value === selectedAnswer);
      if (option?.correct) {
        totalScore += 10;
        breakdown[q.category] += 10;
      }
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    
    let level = "";
    let recommendations: string[] = [];

    if (percentage >= 80) {
      level = "Expert";
      recommendations = [
        "Consider mentoring junior developers in this field",
        "Contribute to open source projects",
        "Lead technical initiatives and architecture decisions",
        "Share knowledge through blog posts or talks"
      ];
    } else if (percentage >= 60) {
      level = "Advanced";
      recommendations = [
        "Focus on complex projects to deepen expertise",
        "Start contributing to code reviews",
        "Learn system design and architecture",
        "Consider specialized certifications"
      ];
    } else if (percentage >= 40) {
      level = "Intermediate";
      recommendations = [
        "Build more projects to practice fundamentals",
        "Study design patterns and best practices",
        "Learn about testing and documentation",
        "Get comfortable with debugging tools"
      ];
    } else {
      level = "Beginner";
      recommendations = [
        "Focus on core fundamentals first",
        "Complete comprehensive tutorials",
        "Build small projects to apply concepts",
        "Join developer communities for support"
      ];
    }

    // Try to save results to API
    try {
      await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          score: totalScore,
          maxScore,
          percentage,
          answers
        })
      });
    } catch (e) {
      console.error('Failed to save quiz results:', e);
    }

    setResult({
      category: selectedCategory!,
      score: totalScore,
      maxScore,
      percentage,
      breakdown,
      recommendations,
      level
    });

    setStep("results");
    setLoading(false);
  };

  const handleRetake = () => {
    setStep("categories");
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setQuestions([]);
    setUserPerformance({ correct: 0, total: 0, recentDifficulties: [] });
    setCurrentDifficulty("medium");
    setShowExplanation(false);
  };

  const currentQ = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / Math.min(questions.length, TOTAL_QUESTIONS)) * 100 : 0;

  // Get current answer status
  const getCurrentAnswerStatus = () => {
    if (!currentQ || !answers[currentQ.id]) return null;
    const selectedOption = currentQ.options.find(o => o.value === answers[currentQ.id]);
    return selectedOption?.correct ? 'correct' : 'incorrect';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Career Skill Assessment</h1>
            {aiPowered && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Adaptive questions that learn from your performance
          </p>
        </div>

        {/* Categories Selection */}
        <AnimatePresence mode="wait">
          {step === "categories" && (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {JOB_CATEGORIES.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center mb-4`}>
                        <category.icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quiz Questions */}
          {step === "quiz" && selectedCategory && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">
                      Question {currentQuestionIndex + 1} of {Math.min(questions.length, TOTAL_QUESTIONS)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant={currentDifficulty === 'hard' ? 'destructive' : currentDifficulty === 'easy' ? 'secondary' : 'default'}>
                        <Zap className="w-3 h-3 mr-1" />
                        {currentDifficulty.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {generatingQuestion && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating AI question...
                    </div>
                  )}
                  <CardTitle className="mt-4">
                    {generatingQuestion ? "Loading question..." : currentQ?.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentQ && (
                    <RadioGroup
                      value={answers[currentQ.id] || ""}
                      onValueChange={(value) => handleAnswer(currentQ.id, value)}
                      disabled={generatingQuestion}
                      className="space-y-3"
                    >
                      {currentQ.options.map((option) => {
                        const isSelected = answers[currentQ.id] === option.value;
                        const showCorrect = showExplanation && option.correct;
                        const showIncorrect = showExplanation && isSelected && !option.correct;
                        
                        return (
                          <div
                            key={option.value}
                            className={`flex items-center space-x-2 p-4 rounded-lg border transition-all cursor-pointer ${
                              showCorrect 
                                ? "border-green-500 bg-green-500/10" 
                                : showIncorrect 
                                  ? "border-red-500 bg-red-500/10"
                                  : isSelected
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="cursor-pointer flex-1 flex items-center justify-between">
                              <span>{option.label}</span>
                              {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                              {showIncorrect && <AlertCircle className="w-5 h-5 text-red-500" />}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {/* Explanation after answering */}
                  {showExplanation && currentQ && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-lg ${
                        getCurrentAnswerStatus() === 'correct' 
                          ? "bg-green-500/10 border border-green-500/30" 
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getCurrentAnswerStatus() === 'correct' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium mb-1">
                            {getCurrentAnswerStatus() === 'correct' ? "Correct!" : "Incorrect"}
                          </p>
                          <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0 || loading || generatingQuestion}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNext} 
                      disabled={loading || !answers[currentQ?.id || ""] || generatingQuestion}
                    >
                      {loading || generatingQuestion ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : showExplanation ? (
                        "Next Question..."
                      ) : currentQuestionIndex >= TOTAL_QUESTIONS - 1 ? (
                        "See Results"
                      ) : (
                        <>
                          Check Answer
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {step === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="mb-6">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{result.level}</CardTitle>
                  <CardDescription>
                    {JOB_CATEGORIES.find(c => c.id === result.category)?.name} Assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gradient mb-2">
                      {result.percentage}%
                    </div>
                    <p className="text-muted-foreground">
                      {result.score} out of {result.maxScore} points
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-primary/10">
                      <div className="text-2xl font-bold text-primary">
                        {result.breakdown.technical}%
                      </div>
                      <div className="text-xs text-muted-foreground">Technical</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/10">
                      <div className="text-2xl font-bold text-secondary">
                        {result.breakdown.behavioral}%
                      </div>
                      <div className="text-xs text-muted-foreground">Behavioral</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-amber-500/10">
                      <div className="text-2xl font-bold text-amber-500">
                        {result.breakdown.situational}%
                      </div>
                      <div className="text-xs text-muted-foreground">Situational</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={handleRetake} className="flex-1">
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Take Another Quiz
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/advise'}>
                  <MessageSquareIcon className="w-4 h-4 mr-2" />
                  Get AI Advice
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Icon components
function RefreshCwIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}


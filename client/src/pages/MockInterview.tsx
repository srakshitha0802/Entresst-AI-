import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Clock, 
  Send, 
  Brain, 
  Target, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Sparkles,
  ChevronRight,
  PlayCircle,
  RefreshCw,
  Volume2,
  MessageSquare,
  Briefcase,
  Code,
  Users,
  Zap,
  Award,
  AlertTriangle,
  StopCircle,
  SkipForward,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const INTERVIEW_TYPES = [
  { id: 'technical', name: 'Technical', icon: Code, color: 'text-blue-400', bgColor: 'bg-blue-400/10', description: 'Data structures, algorithms, system design' },
  { id: 'behavioral', name: 'Behavioral', icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-400/10', description: 'STAR method questions, soft skills' },
  { id: 'system-design', name: 'System Design', icon: Brain, color: 'text-green-400', bgColor: 'bg-green-400/10', description: 'Scalability, architecture, design patterns' },
  { id: 'coding', name: 'Coding Challenge', icon: Code, color: 'text-amber-400', bgColor: 'bg-amber-400/10', description: 'Live coding problems with time limit' },
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Easy', color: 'text-green-400', bgColor: 'bg-green-400/10' },
  { id: 'medium', name: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  { id: 'hard', name: 'Hard', color: 'text-red-400', bgColor: 'bg-red-400/10' },
];

const TECHNICAL_QUESTIONS = {
  easy: [
    { id: 't-e-1', question: 'Explain the difference between let, const, and var in JavaScript.', answer: 'Use let for reassignable variables, const for constants, var is function-scoped (avoid in modern JS).' },
    { id: 't-e-2', question: 'What is a linked list? Describe its basic operations.', answer: 'A linear data structure where elements are stored in nodes with pointers to next node. Operations: insert, delete, search.' },
    { id: 't-e-3', question: 'What is time complexity? Explain Big O notation.', answer: 'Time complexity measures algorithm efficiency as input grows. Big O describes worst-case upper bound.' },
    { id: 't-e-4', question: 'Explain the concept of recursion.', answer: 'A function that calls itself to solve smaller instances of the same problem.' },
    { id: 't-e-5', question: 'What is the difference between an array and a hash map?', answer: 'Arrays use indexed access O(1), hash maps use key-value pairs with O(1) average lookup.' },
  ],
  medium: [
    { id: 't-m-1', question: 'Implement a function to reverse a linked list.', answer: 'Use three pointers: prev, current, next. Iterate and reverse pointers.' },
    { id: 't-m-2', question: 'Explain how QuickSort works. What is its time complexity?', answer: 'Divide and conquer: pick pivot, partition, recursively sort. Average O(n log n), worst O(n²).' },
    { id: 't-m-3', question: 'What is a deadlock? How can you prevent it?', answer: 'Circular wait for resources. Prevention: lock ordering, timeout, resource hierarchy.' },
    { id: 't-m-4', question: 'Explain the difference between SQL and NoSQL databases.', answer: 'SQL: relational, structured, ACID. NoSQL: non-relational, flexible schema, horizontal scaling.' },
    { id: 't-m-5', question: 'What is the OSI model? Explain each layer.', answer: '7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
  ],
  hard: [
    { id: 't-h-1', question: 'Design a distributed rate limiter system.', answer: 'Use token bucket/leaky bucket algorithms, Redis for counter, consistent hashing for scaling.' },
    { id: 't-h-2', question: 'Explain the CAP theorem and its implications.', answer: 'Consistency, Availability, Partition tolerance - can only guarantee 2 of 3 in distributed systems.' },
    { id: 't-h-3', question: 'How would you design a real-time collaborative editor?', answer: 'Use CRDTs or operational transformation, WebSockets, operational transformation for conflict resolution.' },
    { id: 't-h-4', question: 'Design a system to handle millions of concurrent connections.', answer: 'Event-driven architecture, non-blocking I/O, load balancing, horizontal scaling, caching.' },
    { id: 't-h-5', question: 'Explain database sharding strategies and their trade-offs.', answer: 'Horizontal partitioning by key range/hash. Trade-offs: cross-shard queries, rebalancing, hotspots.' },
  ]
};

const BEHAVIORAL_QUESTIONS = {
  easy: [
    { id: 'b-e-1', question: 'Tell me about yourself.', answer: 'Focus on relevant experience, career goals, and why you are interested in this role.' },
    { id: 'b-e-2', question: 'What are your greatest strengths?', answer: 'Pick 2-3 relevant strengths with specific examples from your experience.' },
    { id: 'b-e-3', question: 'What are your weaknesses?', answer: 'Be honest but show self-improvement efforts. Choose a weakness that is not critical to the role.' },
  ],
  medium: [
    { id: 'b-m-1', question: 'Tell me about a time you faced a challenge at work.', answer: 'Use STAR: Situation, Task, Action, Result. Focus on problem-solving and positive outcomes.' },
    { id: 'b-m-2', question: 'Describe a time you had a conflict with a coworker.', answer: 'Show conflict resolution skills, empathy, and professional communication.' },
    { id: 'b-m-3', question: 'Why do you want to work here?', answer: 'Research the company. Align your goals with company mission and values.' },
  ],
  hard: [
    { id: 'b-h-1', question: 'Tell me about a time you failed. How did you handle it?', answer: 'Be honest about failure, show what you learned, and how you improved afterward.' },
    { id: 'b-h-2', question: 'How do you handle tight deadlines?', answer: 'Discuss prioritization, time management, and staying calm under pressure.' },
    { id: 'b-h-3', question: 'Describe a time you had to convince your team to adopt a new approach.', answer: 'Show leadership, communication skills, and data-driven decision making.' },
  ]
};

interface InterviewSession {
  id: string;
  type: string;
  difficulty: string;
  questions: { id: string; question: string; answer: string; userAnswer?: string; feedback?: string; rating?: number }[];
  currentQuestion: number;
  timeRemaining: number;
  isActive: boolean;
  startTime: Date;
  score: number;
}

interface InterviewResult {
  id: string;
  type: string;
  difficulty: string;
  score: number;
  maxScore: number;
  date: Date;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export default function MockInterview() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedResults = localStorage.getItem('interview_results');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  useEffect(() => {
    if (session?.isActive && session.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= session.timeRemaining) {
            if (timerRef.current) clearInterval(timerRef.current);
            return session.timeRemaining;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.isActive, session?.timeRemaining]);

  const startInterview = () => {
    const questions = interviewType === 'technical' 
      ? TECHNICAL_QUESTIONS[difficulty as keyof typeof TECHNICAL_QUESTIONS]
      : BEHAVIORAL_QUESTIONS[difficulty as keyof typeof BEHAVIORAL_QUESTIONS];
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
    
    const newSession: InterviewSession = {
      id: `session_${Date.now()}`,
      type: interviewType,
      difficulty,
      questions: shuffled.map(q => ({ ...q, userAnswer: '', feedback: '', rating: 0 })),
      currentQuestion: 0,
      timeRemaining: difficulty === 'easy' ? 300 : difficulty === 'medium' ? 240 : 180,
      isActive: true,
      startTime: new Date(),
      score: 0
    };
    
    setSession(newSession);
    setCurrentTime(0);
    setUserAnswer('');
    setShowAnswer(false);
    setShowFeedback(false);
  };

  const submitAnswer = async () => {
    if (!session) return;

    const updatedQuestions = [...session.questions];
    updatedQuestions[session.currentQuestion].userAnswer = userAnswer;

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an interview coach. Evaluate this answer to the interview question and provide feedback.
          
Question: ${session.questions[session.currentQuestion].question}

Candidate's Answer: ${userAnswer}

Provide feedback in JSON format:
{
  "rating": 1-10,
  "feedback": "2-3 sentences of constructive feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`,
          provider: 'gemini'
        })
      });

      if (response.ok) {
        const data = await response.json();
        try {
          const parsed = JSON.parse(data.response);
          updatedQuestions[session.currentQuestion].feedback = parsed.feedback || parsed.feedback;
          updatedQuestions[session.currentQuestion].rating = parsed.rating || 5;
        } catch {
          updatedQuestions[session.currentQuestion].feedback = data.response.substring(0, 200);
          updatedQuestions[session.currentQuestion].rating = 5;
        }
      }
    } catch (error) {
      console.error('Feedback error:', error);
      updatedQuestions[session.currentQuestion].feedback = 'Focus on being more specific and using the STAR method.';
      updatedQuestions[session.currentQuestion].rating = 5;
    }

    setSession({ ...session, questions: updatedQuestions });
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestion < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestion: session.currentQuestion + 1,
      });
      setUserAnswer('');
      setShowAnswer(false);
      setShowFeedback(false);
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    if (!session) return;

    const totalScore = session.questions.reduce((acc, q) => acc + (q.rating || 0), 0);
    const maxScore = session.questions.length * 10;

    const result: InterviewResult = {
      id: session.id,
      type: session.type,
      difficulty: session.difficulty,
      score: totalScore,
      maxScore,
      date: new Date(),
      strengths: ['Clear communication', 'Relevant experience'],
      improvements: ['More specific examples', 'STAR method'],
      recommendations: ['Practice more behavioral questions', 'Prepare more specific examples']
    };

    const newResults = [result, ...results];
    setResults(newResults);
    localStorage.setItem('interview_results', JSON.stringify(newResults));

    setSession({ ...session, isActive: false });
    toast({ title: 'Interview completed!', description: `Your score: ${totalScore}/${maxScore}` });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = session?.questions[session.currentQuestion];

  if (session === null) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              AI Mock Interview
            </h1>
            <p className="text-muted-foreground">Practice with AI-powered interview questions and feedback</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {results.length} Sessions Completed
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
              <CardDescription>Configure your mock interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Interview Type</label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(level => (
                      <SelectItem key={level.id} value={level.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${level.bgColor}`} />
                          {level.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">What to expect</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {DIFFICULTY_LEVELS.find(l => l.id === difficulty)?.name === 'Easy' 
                    ? '5 questions, 5 minutes each. Great for beginners.'
                    : DIFFICULTY_LEVELS.find(l => l.id === difficulty)?.name === 'Medium'
                    ? '5 questions, 4 minutes each. Intermediate level.'
                    : '5 questions, 3 minutes each. Advanced challenges.'}
                </p>
              </div>

              <Button onClick={startInterview} className="w-full" size="lg">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Interview
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Review your previous interview sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.slice(0, 5).map((result) => (
                    <div key={result.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{result.type}</Badge>
                          <Badge variant={result.difficulty === 'easy' ? 'secondary' : result.difficulty === 'medium' ? 'outline' : 'destructive'}>{result.difficulty}</Badge>
                        </div>
                        <span className={`font-bold ${result.score / result.maxScore >= 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {result.score}/{result.maxScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No interviews yet</p>
                  <p className="text-sm text-muted-foreground">Start your first mock interview!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session.isActive) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
              <Award className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Interview Complete!</CardTitle>
            <CardDescription>
              {session.type} - {session.difficulty} difficulty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gradient mb-2">
                {Math.round((session.questions.reduce((acc, q) => acc + (q.rating || 0), 0) / (session.questions.length * 10)) * 100)}%
              </div>
              <p className="text-muted-foreground">
                Score: {session.questions.reduce((acc, q) => acc + (q.rating || 0), 0)}/{session.questions.length * 10}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {['Clear communication', 'Relevant examples', 'Structured answers'].map((s, i) => (
                    <div key={i} className="p-2 rounded bg-green-500/10 text-sm">{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Areas to Improve
                </h4>
                <div className="space-y-2">
                  {['More specific examples', 'STAR method', 'Technical depth'].map((s, i) => (
                    <div key={i} className="p-2 rounded bg-amber-500/10 text-sm">{s}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                Recommendations
              </h4>
              <div className="p-4 rounded-lg bg-blue-500/10">
                <p className="text-sm">Continue practicing {session.type} questions. Focus on providing specific examples from your experience.</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => setSession(null)} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                New Interview
              </Button>
              <Button variant="outline" onClick={() => setSession(null)} className="flex-1">
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            AI Mock Interview
          </h1>
          <p className="text-muted-foreground">Practice with AI-powered interview questions and feedback</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {results.length} Sessions Completed
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={session.difficulty === 'easy' ? 'secondary' : session.difficulty === 'medium' ? 'outline' : 'destructive'}>
                    {session.difficulty}
                  </Badge>
                  <Badge variant="outline">Question {session.currentQuestion + 1}/{session.questions.length}</Badge>
                </div>
                <div className="flex items-center gap-2 text-lg font-mono">
                  <Clock className="w-5 h-5 text-primary" />
                  {formatTime(session.timeRemaining - currentTime)}
                </div>
              </div>
              <Progress value={((session.currentQuestion + 1) / session.questions.length) * 100} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="text-lg font-semibold flex items-start gap-2">
                  <span className="text-primary">Q{session.currentQuestion + 1}:</span>
                  {currentQuestion?.question}
                </h3>
              </div>

              <Textarea
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={6}
                className="resize-none"
                disabled={showFeedback}
              />

              {showFeedback && currentQuestion?.feedback && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">AI Feedback</span>
                    <div className="ml-auto flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${i <= (currentQuestion.rating || 0) / 2 ? 'bg-green-400' : 'bg-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm">{currentQuestion.feedback}</p>
                </div>
              )}

              {showAnswer && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">Sample Answer</span>
                  </div>
                  <p className="text-sm">{currentQuestion?.answer}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!showFeedback ? (
                  <>
                    <Button onClick={submitAnswer} disabled={!userAnswer.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Answer
                    </Button>
                    <Button variant="outline" onClick={() => setShowAnswer(true)} disabled={showFeedback}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Show Answer
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={nextQuestion}>
                      {session.currentQuestion < session.questions.length - 1 ? (
                        <>Next Question <ChevronRight className="w-4 h-4 ml-2" /></>
                      ) : (
                        <>Finish Interview <Award className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                    {!showAnswer && (
                      <Button variant="outline" onClick={() => setShowAnswer(true)}>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        View Sample Answer
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Take your time to think before answering</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Use STAR method for behavioral questions</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Ask clarifying questions if needed</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Think out loud during coding questions</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {session.questions.map((q, i) => (
                  <div 
                    key={q.id}
                    className={`flex-1 h-2 rounded-full ${
                      i < session.currentQuestion 
                        ? q.rating && q.rating >= 5 ? 'bg-green-500' : 'bg-yellow-500'
                        : i === session.currentQuestion ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {session.questions.filter(q => q.rating).length} answered
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


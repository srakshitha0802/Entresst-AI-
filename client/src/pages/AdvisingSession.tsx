import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, BookOpen, ExternalLink, ArrowRight } from "lucide-react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp?: string;
}

interface Recommendation {
  title: string;
  type: string;
  urgency: string;
  description?: string;
  progress?: number;
}

export default function AdvisingSession() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showInteractiveContent, setShowInteractiveContent] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial data and recommendations on mount
    const initializeSession = async () => {
      try {
        // Get user profile for personalized greeting
        const profileRes = await fetch('/api/user/profile');
        const profile = profileRes.ok ? await profileRes.json() : { name: 'User' };

        // Get recommendations
        const recRes = await fetch('/api/recommendations');
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData.map((r: Recommendation) => ({ ...r, progress: 15 })));
        }

        // Set initial greeting with real user name
        setMessages([{ 
          role: 'assistant', 
          content: `Hello ${profile.name}! I've analyzed your career profile. To help you reach your goal as ${profile.targetRole || 'a senior role'}, I've identified key areas for growth. How would you like to proceed?`
        }]);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Fallback greeting
        setMessages([{ 
          role: 'assistant', 
          content: "Hello! I've analyzed your career profile. How can I help you with your career growth today?"
        }]);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      // Call real AI chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          context: { targetRole: 'Senior Full Stack Developer' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.content,
          timestamp: data.timestamp
        }]);
        
        // Show interactive content after first response
        if (!showInteractiveContent) {
          setShowInteractiveContent(true);
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or check if the AI service is properly configured."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "What skills do I need for my target role?",
    "Create a personalized learning plan",
    "Analyze my current skill gaps",
    "Suggest career advancement opportunities"
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Chat Area */}
      <div className={`flex flex-col h-full transition-all duration-500 ease-in-out ${showInteractiveContent ? 'w-1/2 border-r border-white/10' : 'w-full max-w-4xl mx-auto'}`}>
        <div className="p-6 border-b border-white/10 glass-panel border-x-0 border-t-0 rounded-none z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="text-primary w-6 h-6" /> 
            AI Advisor Session
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Personalised career mapping & skill gap analysis.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}`}>
                  {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'assistant' ? 'bg-card border border-white/5 shadow-lg' : 'bg-primary text-primary-foreground'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-card border border-white/5 flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 bg-background z-10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for guidance or answer the prompt..."
              className="w-full bg-card border border-white/10 rounded-xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              data-testid="input-chat"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              data-testid="button-send-chat"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {suggestions.map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => setInput(suggestion)}
                disabled={isTyping}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-all disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Content Area (Dynamically Generated) */}
      <AnimatePresence>
        {showInteractiveContent && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "50%", opacity: 1 }}
            className="h-full bg-card/30 relative overflow-y-auto"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-gradient">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Adaptive Roadmap
                </h3>
              </div>

              <div className="space-y-4">
                {recommendations.length > 0 ? recommendations.map((rec, i) => (
                  <div key={i} className="p-5 rounded-2xl glass-panel relative overflow-hidden group border-primary/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BookOpen className="w-24 h-24 text-primary" />
                    </div>
                    <h4 className="text-lg font-bold mb-2 relative z-10">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4 w-4/5 relative z-10">
                      {rec.description || 'Personalized content based on your skill gaps and career goals.'}
                    </p>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${rec.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{rec.progress || 0}%</span>
                    </div>
                    <button className="mt-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative z-10">
                      Start Learning <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )) : (
                  <div className="p-5 rounded-2xl border border-white/5 bg-black/20">
                    <h4 className="text-lg font-bold mb-2">Complete Assessment</h4>
                    <p className="text-sm text-muted-foreground mb-4">Take the skill assessment to get personalized recommendations.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-secondary" />
                  Suggested Real-world Projects
                </h4>
                <div className="grid gap-3">
                  {[
                    "Build a real-time collaborative document editor",
                    "Design an e-commerce checkout state machine",
                    "Create a microservices-based API gateway"
                  ].map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 hover:border-secondary/30 bg-white/5 cursor-pointer transition-colors">
                      <p className="text-sm font-medium">{proj}</p>
                      <p className="text-xs text-muted-foreground mt-1">Est. 12 hours • High Impact</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


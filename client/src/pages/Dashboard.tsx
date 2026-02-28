import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  TrendingUp, 
  BrainCircuit, 
  Award,
  ChevronRight,
  Zap
} from "lucide-react";
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

interface SkillData {
  subject: string;
  A: number;
  fullMark: number;
}

interface MarketDemand {
  name: string;
  demand: number;
}

interface Statistics {
  roleMatch: number;
  skillGaps: number;
  marketGrowth: number;
  certificationsDue: number;
}

interface UserProfile {
  name: string;
  role: string;
  targetRole: string;
}

interface Recommendation {
  title: string;
  type: string;
  urgency: string;
  description?: string;
}

export default function Dashboard() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [marketDemand, setMarketDemand] = useState<MarketDemand[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Fetch user context for enhanced personalization
  const fetchUserContext = async () => {
    try {
      const response = await fetch('/api/feedback/user-context');
      if (response.ok) {
        const context = await response.json();
        if (context.performance) {
          // Set personalized difficulty based on performance
          const accuracy = context.performance.correct / (context.performance.total || 1);
          if (accuracy > 0.8 && context.performance.total > 3) {
            setDifficulty("hard");
          } else if (accuracy < 0.5 && context.performance.total > 3) {
            setDifficulty("easy");
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user context:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Fetch skills
        const skillsRes = await fetch('/api/skills');
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json();
          setSkills(skillsData);
        }

        // Fetch statistics
        const statsRes = await fetch('/api/statistics');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch market demand
        const demandRes = await fetch('/api/market/demand');
        if (demandRes.ok) {
          const demandData = await demandRes.json();
          setMarketDemand(demandData);
        }

        // Fetch recommendations
        const recRes = await fetch('/api/recommendations');
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData);
        }

        // Fetch user context for personalization
        await fetchUserContext();
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGeneratePath = async () => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: 'Generate a personalized career learning path based on the user profile and skill gaps. Include specific courses, projects, and certifications.',
          provider: 'gemini'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Generated path:', data);
        // Could update UI with generated content
      }
    } catch (error) {
      console.error('Failed to generate path:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user needs to complete profile setup
  const needsSetup = !profile || !profile.name;

  if (needsSetup) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              Welcome to <span className="text-gradient">Entresst</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Your AI-powered career development platform
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Complete Your Profile", value: "0%", icon: Target, color: "text-primary", desc: "Set up your career goals" },
            { title: "Skills Tracked", value: "0", icon: BrainCircuit, color: "text-secondary", desc: "Add your technical skills" },
            { title: "Market Insights", value: "0", icon: TrendingUp, color: "text-green-400", desc: "Coming soon" },
            { title: "Recommendations", value: "0", icon: Award, color: "text-amber-400", desc: "Complete setup to get AI suggestions" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-panel p-6 rounded-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              </div>
              <p className="text-3xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 glass-panel p-8 rounded-2xl text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-6 flex items-center justify-center">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Complete Your Profile Setup</h2>
            <p className="text-muted-foreground mb-6">
              Get personalized career recommendations, skill gap analysis, and AI-powered insights by completing your profile.
            </p>
            <a 
              href="/setup"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Set Up Your Profile
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{profile?.name || 'User'}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {profile?.role || 'Developer'} → {profile?.targetRole || 'Next Level'}
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={handleGeneratePath}
          className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/30 transition-colors cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          Generate New Path
        </motion.button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Current Role Match", value: `${stats?.roleMatch || 0}%`, icon: Target, color: "text-primary" },
          { title: "Skill Gap", value: `${stats?.skillGaps || 0} Areas`, icon: BrainCircuit, color: "text-secondary" },
          { title: "Market Growth", value: `+${stats?.marketGrowth || 0}%`, icon: TrendingUp, color: "text-green-400" },
          { title: "Certifications", value: `${stats?.certificationsDue || 0} Due`, icon: Award, color: "text-amber-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass-panel p-6 rounded-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
            </div>
            <p className="text-3xl font-bold font-mono">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 glass-panel p-6 rounded-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Skill Profile Analysis</h2>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">AI Generated</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills.length > 0 ? skills : [
                { subject: 'React', A: 0, fullMark: 150 },
                { subject: 'Node.js', A: 0, fullMark: 150 },
                { subject: 'System Design', A: 0, fullMark: 150 },
                { subject: 'Python', A: 0, fullMark: 150 },
                { subject: 'DevOps', A: 0, fullMark: 150 },
                { subject: 'UI/UX', A: 0, fullMark: 150 },
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <Radar name="Current Skills" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 rounded-2xl flex flex-col"
        >
          <h2 className="text-xl font-semibold mb-6">AI Recommendations</h2>
          <div className="space-y-4 flex-1">
            {recommendations.length > 0 ? recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{rec.type}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${rec.urgency === 'High' ? 'bg-destructive/20 text-destructive-foreground' : 'bg-secondary/20 text-secondary'}`}>
                    {rec.urgency}
                  </span>
                </div>
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{rec.title}</h4>
                {rec.description && (
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                )}
              </div>
            )) : (
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-sm text-muted-foreground">No recommendations yet</p>
              </div>
            )}
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-foreground transition-colors py-2">
            View All Action Items <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}


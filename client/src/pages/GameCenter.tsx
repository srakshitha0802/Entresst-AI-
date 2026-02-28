import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  Flame, 
  Award, 
  Target,
  Crown,
  Medal,
  ChevronRight,
  RefreshCw,
  Lock,
  Unlock,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Code,
  Brain,
  Rocket,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface GameStats {
  xp: number;
  level: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  longestStreak: number;
  topics: Record<string, { mastery: number; attempts: number; correct: number }>;
  badges: string[];
  lastActivity: string | null;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  badges: number;
}

const BADGE_INFO: Record<string, { name: string; icon: any; color: string; description: string }> = {
  first_wins: { name: "First Victory", icon: Star, color: "text-yellow-400", description: "Answer 10 questions correctly" },
  streak_5: { name: "On Fire!", icon: Flame, color: "text-orange-400", description: "Get a 5 question streak" },
  master_react: { name: "React Master", icon: Code, color: "text-blue-400", description: "Reach 80% mastery in React" },
  master_javascript: { name: "JS Master", icon: Code, color: "text-yellow-400", description: "Reach 80% mastery in JavaScript" },
  level_5: { name: "Rising Star", icon: TrendingUp, color: "text-green-400", description: "Reach level 5" },
  level_10: { name: "Expert", icon: Trophy, color: "text-purple-400", description: "Reach level 10" },
};

const TOPIC_COLORS: Record<string, string> = {
  "React": "from-blue-500 to-cyan-500",
  "JavaScript": "from-yellow-500 to-orange-500",
  "Node.js": "from-green-500 to-emerald-500",
  "Python": "from-blue-500 to-indigo-500",
  "TypeScript": "from-blue-600 to-blue-400",
  "default": "from-purple-500 to-pink-500"
};

export default function GameCenter() {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("React");
  const { toast } = useToast();

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    setLoading(true);
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        fetch('/api/game/stats'),
        fetch('/api/game/leaderboard')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (leaderboardRes.ok) {
        const lbData = await leaderboardRes.json();
        setLeaderboard(lbData);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate XP needed for next level
  const getXPForLevel = (level: number) => Math.pow(level, 2) * 100;
  const currentLevelXP = getXPForLevel(stats?.level || 1);
  const nextLevelXP = getXPForLevel((stats?.level || 1) + 1);
  const xpProgress = stats ? ((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;

  const accuracy = stats?.totalQuestionsAnswered 
    ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100) 
    : 0;

  const topicList = stats?.topics 
    ? Object.entries(stats.topics).map(([topic, data]) => ({ topic, ...data }))
    : [];

  const unlockedBadges = stats?.badges?.filter(b => b.startsWith('master_') || b === 'first_wins' || b === 'streak_5') || [];
  const lockedBadges = ['first_wins', 'streak_5'].filter(b => !unlockedBadges.includes(b));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header with Level & XP */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">Game Center</h1>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Gamified Learning
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Track your progress, earn XP, and unlock achievements
            </p>
          </div>
          <Button variant="outline" onClick={fetchGameData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Level Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Level Badge */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{stats?.level || 1}</div>
                    <div className="text-xs uppercase">Level</div>
                  </div>
                </div>
                <Crown className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400" />
              </div>

              {/* XP Progress */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-xl">{stats?.xp || 0} XP</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {nextLevelXP - (stats?.xp || 0)} XP to Level {(stats?.level || 1) + 1}
                  </span>
                </div>
                <Progress value={xpProgress} className="h-3" />
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{accuracy}% Accuracy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">🔥 {stats?.currentStreak || 0} Streak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">{unlockedBadges.length} Badges</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">Topic Mastery</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Questions Answered</p>
                      <p className="text-2xl font-bold">{stats?.totalQuestionsAnswered || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Correct Answers</p>
                      <p className="text-2xl font-bold">{stats?.correctAnswers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Best Streak</p>
                      <p className="text-2xl font-bold">{stats?.longestStreak || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Badges Earned</p>
                      <p className="text-2xl font-bold">{unlockedBadges.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Badges Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unlockedBadges.length > 0 ? (
                  <div className="flex gap-4 flex-wrap">
                    {unlockedBadges.slice(0, 5).map((badge) => {
                      const info = BADGE_INFO[badge] || { name: badge, icon: Award, color: "text-gray-400", description: "" };
                      return (
                        <div key={badge} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                          <info.icon className={`w-6 h-6 ${info.color}`} />
                          <span className="font-medium">{info.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Complete quizzes to earn badges!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Topic Mastery Tab */}
          <TabsContent value="topics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicList.length > 0 ? topicList.map(({ topic, mastery, attempts, correct }) => {
                const colorClass = TOPIC_COLORS[topic] || TOPIC_COLORS.default;
                const masteryPercent = Math.round(mastery * 100);
                
                return (
                  <Card key={topic} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{topic}</CardTitle>
                        <Badge variant={masteryPercent >= 80 ? "default" : masteryPercent >= 50 ? "secondary" : "outline"}>
                          {masteryPercent}% Mastery
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={masteryPercent} className="h-2 mb-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{attempts} attempts</span>
                        <span className="text-muted-foreground">{correct} correct</span>
                      </div>
                      {masteryPercent >= 75 && (
                        <Button size="sm" className="w-full mt-4" variant="outline">
                          <Crown className="w-4 h-4 mr-2" />
                          Boss Battle
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              }) : (
                <Card className="col-span-2">
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Take quizzes to build topic mastery!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Unlocked Badges */}
              {unlockedBadges.map((badge) => {
                const info = BADGE_INFO[badge] || { name: badge, icon: Award, color: "text-gray-400", description: "" };
                return (
                  <Card key={badge} className="border-primary/30 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center`}>
                        <info.icon className={`w-8 h-8 ${info.color}`} />
                      </div>
                      <h3 className="font-bold">{info.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                      <Badge className="mt-3 bg-green-500/20 text-green-400">
                        <Unlock className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Locked Badges */}
              {lockedBadges.map((badge) => {
                const info = BADGE_INFO[badge] || { name: badge, icon: Award, color: "text-gray-400", description: "" };
                return (
                  <Card key={badge} className="opacity-60">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-bold text-muted-foreground">{info.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                      <Badge variant="outline" className="mt-3">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div 
                      key={entry.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        entry.name === 'You' ? 'bg-primary/10 border border-primary/30' : 'bg-muted'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                        entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-muted'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{entry.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Level {entry.level}</span>
                          <span>•</span>
                          <span>{entry.xp} XP</span>
                          <span>•</span>
                          <span>{entry.badges} badges</span>
                        </div>
                      </div>
                      {entry.rank <= 3 && (
                        <Trophy className={`w-6 h-6 ${
                          entry.rank === 1 ? 'text-yellow-400' :
                          entry.rank === 2 ? 'text-gray-400' :
                          'text-orange-400'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}


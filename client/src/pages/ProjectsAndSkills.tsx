import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Code, 
  Lightbulb, 
  Target, 
  ChevronRight, 
  CheckCircle,
  Clock,
  Zap,
  Rocket,
  RefreshCw,
  Loader2,
  BookOpen,
  Award,
  ArrowRight,
  Layers,
  GitBranch,
  CheckSquare
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Types
interface GeneratedProject {
  title: string;
  description: string;
  problemStatement: string;
  userStories: string[];
  techStack: string[];
  learningObjectives: string[];
  stretchGoals: string[];
  difficulty: string;
  estimatedTime: string;
}

interface SkillTreeNode {
  id: string;
  skill: string;
  level: string;
  status: 'completed' | 'available' | 'locked';
  prerequisites: string[];
  position: { x: number; y: number };
}

interface SkillTree {
  nodes: SkillTreeNode[];
  connections: { from: string; to: string }[];
}

interface SkillTreeData {
  skillTree: SkillTree;
  learningPath: { skill: string; priority: number; reason: string }[];
  unlockedSkills: string[];
  nextMilestone: string;
}

export default function ProjectsAndSkills() {
  const [activeTab, setActiveTab] = useState("projects");
  const [generatingProject, setGeneratingProject] = useState(false);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [skillTree, setSkillTree] = useState<SkillTreeData | null>(null);
  const [loadingSkillTree, setLoadingSkillTree] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [completedSkills, setCompletedSkills] = useState<string[]>([]);
  const [projectStarted, setProjectStarted] = useState(false);
  const { toast } = useToast();

  // Fetch user skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/skills');
        if (res.ok) {
          const data = await res.json();
          setUserSkills(data.map((s: any) => s.subject));
        }
        
        // Get target role
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile?.targetRole) {
            setTargetRole(profile.targetRole);
          }
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    fetchSkills();
  }, []);

  // Generate AI Project
  const generateProject = async () => {
    setGeneratingProject(true);
    try {
      const response = await fetch('/api/ai/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: userSkills,
          weakAreas: [], // Could be derived from quiz performance
          targetRole,
          difficulty: 'medium'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data);
        toast({
          title: "Project Generated!",
          description: "AI created a personalized project based on your skills",
        });
      } else {
        throw new Error('Failed to generate');
      }
    } catch (error) {
      console.error('Error generating project:', error);
      toast({
        title: "Using Default Project",
        description: "AI unavailable, showing sample project",
        variant: "destructive"
      });
    } finally {
      setGeneratingProject(false);
    }
  };

  // Generate Skill Tree
  const generateSkillTree = async () => {
    setLoadingSkillTree(true);
    try {
      const response = await fetch('/api/ai/skill-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSkills: userSkills,
          targetRole,
          completedSkills
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSkillTree(data);
      }
    } catch (error) {
      console.error('Error generating skill tree:', error);
    } finally {
      setLoadingSkillTree(false);
    }
  };

  // Mark skill as completed
  const markSkillComplete = async (skillId: string) => {
    setCompletedSkills([...completedSkills, skillId]);
    try {
      await fetch('/api/ai/skill-tree/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, status: 'completed' })
      });
      // Regenerate tree with updated progress
      generateSkillTree();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">Learning Hub</h1>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Personalized projects and adaptive learning paths
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="projects" className="gap-2">
              <Code className="w-4 h-4" />
              Project Generator
            </TabsTrigger>
            <TabsTrigger value="skilltree" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Skill Tree
            </TabsTrigger>
          </TabsList>

          {/* PROJECT GENERATOR TAB */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generate Project Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Project Generator
                  </CardTitle>
                  <CardDescription>
                    Generate a personalized mini-project based on your skills and target role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">Your Profile</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Target Role: <span className="text-foreground font-medium">{targetRole}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Skills: {userSkills.length > 0 ? userSkills.join(', ') : 'None set'}
                    </p>
                  </div>

                  <Button 
                    onClick={generateProject} 
                    disabled={generatingProject}
                    className="w-full"
                    size="lg"
                  >
                    {generatingProject ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Project...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate My Project
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Project Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-secondary" />
                    Your Current Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <p className="text-muted-foreground mt-1">{project.description}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {project.estimatedTime}
                        </Badge>
                        <Badge variant="outline">
                          <Zap className="w-3 h-3 mr-1" />
                          {project.difficulty}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, i) => (
                            <Badge key={i} variant="secondary">{tech}</Badge>
                          ))}
                        </div>
                      </div>

                      {!projectStarted ? (
                        <Button onClick={() => setProjectStarted(true)} className="w-full">
                          Start Project
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Project Started!</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Work through the user stories and learning objectives.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No project yet</p>
                      <p className="text-sm text-muted-foreground">Generate one to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            {project && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Problem Statement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{project.problemStatement}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>User Stories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {project.userStories.map((story, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckSquare className="w-4 h-4 text-primary mt-1" />
                              <span className="text-sm">{story}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Learning Objectives</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {project.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <BookOpen className="w-4 h-4 text-secondary mt-1" />
                              <span className="text-sm">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Stretch Goals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {project.stretchGoals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Rocket className="w-4 h-4 text-amber-400 mt-1" />
                              <span className="text-sm">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>

          {/* SKILL TREE TAB */}
          <TabsContent value="skilltree" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Adaptive Skill Tree
                </CardTitle>
                <CardDescription>
                  Your personalized learning path with unlocked skills based on progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!skillTree ? (
                  <div className="text-center py-8">
                    <Button onClick={generateSkillTree} disabled={loadingSkillTree} size="lg">
                      {loadingSkillTree ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Skill Tree...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate My Skill Tree
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Skill Tree Visualization */}
                    <div className="relative h-[400px] bg-muted/30 rounded-lg overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 800 400">
                        {/* Connections */}
                        {skillTree.skillTree.connections.map((conn, i) => {
                          const fromNode = skillTree.skillTree.nodes.find(n => n.id === conn.from);
                          const toNode = skillTree.skillTree.nodes.find(n => n.id === conn.to);
                          if (!fromNode || !toNode) return null;
                          return (
                            <line
                              key={i}
                              x1={fromNode.position.x + 60}
                              y1={fromNode.position.y + 20}
                              x2={toNode.position.x}
                              y2={toNode.position.y + 20}
                              stroke={toNode.status === 'locked' ? '#666' : '#8b5cf6'}
                              strokeWidth="2"
                              strokeDasharray={toNode.status === 'locked' ? '5,5' : 'none'}
                            />
                          );
                        })}
                        
                        {/* Nodes */}
                        {skillTree.skillTree.nodes.map((node) => (
                          <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
                            <rect
                              width="120"
                              height="40"
                              rx="8"
                              fill={
                                node.status === 'completed' ? '#10b981' :
                                node.status === 'available' ? '#8b5cf6' :
                                '#374151'
                              }
                              opacity={node.status === 'locked' ? 0.5 : 1}
                            />
                            <text
                              x="60"
                              y="25"
                              textAnchor="middle"
                              fill="white"
                              fontSize="12"
                              fontWeight="medium"
                            >
                              {node.skill}
                            </text>
                            {node.status === 'completed' && (
                              <circle cx="110" cy="10" r="8" fill="#10b981" />
                            )}
                          </g>
                        ))}
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500" />
                        <span className="text-sm">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-600" />
                        <span className="text-sm">Locked</span>
                      </div>
                    </div>

                    {/* Next Milestone */}
                    {skillTree.nextMilestone && (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          <span className="font-medium">Next Milestone</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{skillTree.nextMilestone}</p>
                      </div>
                    )}

                    {/* Learning Path */}
                    <div>
                      <h4 className="font-medium mb-3">Recommended Learning Path</h4>
                      <div className="space-y-2">
                        {skillTree.learningPath.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.skill}</p>
                              <p className="text-sm text-muted-foreground">{item.reason}</p>
                            </div>
                            {item.priority === 1 && (
                              <Badge>Next</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button onClick={generateSkillTree} variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Tree
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}


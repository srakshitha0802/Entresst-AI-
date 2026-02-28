import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Briefcase, 
  Target, 
  Code, 
  ChevronRight, 
  Check,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  targetRole: string;
  skills: { subject: string; level: number }[];
}

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Mobile Developer",
  "Cloud Engineer",
  "Software Architect",
  "Product Manager",
  "UI/UX Designer"
];

const TARGET_ROLE_OPTIONS = [
  "Senior Frontend Developer",
  "Senior Backend Developer",
  "Senior Full Stack Developer",
  "Staff Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Tech Lead",
  "Solutions Architect",
  "DevOps Lead",
  "ML Engineering Manager",
  "VP of Engineering"
];

const SKILL_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST APIs",
  "System Design",
  "Machine Learning",
  "Data Engineering",
  "CI/CD",
  "Git"
];

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    role: "",
    targetRole: "",
    skills: []
  });
  const { toast } = useToast();

  const updateFormData = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const exists = prev.skills.find(s => s.subject === skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter(s => s.subject !== skill) };
      }
      return { ...prev, skills: [...prev.skills, { subject: skill, level: 50 }] };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role || !formData.targetRole) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/profile-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create profile');

      toast({
        title: "Success",
        description: "Profile created successfully! Redirecting to dashboard..."
      });

      // Redirect to dashboard after successful profile creation
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = Math.round(
    ((formData.name ? 1 : 0) + 
    (formData.email ? 1 : 0) + 
    (formData.role ? 1 : 0) + 
    (formData.targetRole ? 1 : 0) + 
    (formData.skills.length > 0 ? 1 : 0)) / 5 * 100
  );

  const canProceed = () => {
    switch(step) {
      case 1: return formData.name && formData.email;
      case 2: return formData.role && formData.targetRole;
      case 3: return formData.skills.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Entresst</h1>
          <p className="text-muted-foreground">Let's set up your personalized career journey</p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Profile Completion</span>
            <span className="font-medium">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step 
                  ? 'bg-primary scale-125' 
                  : s < step 
                    ? 'bg-secondary' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <User className="w-5 h-5" />}
              {step === 2 && <Briefcase className="w-5 h-5" />}
              {step === 3 && <Target className="w-5 h-5" />}
              {step === 1 && "Basic Information"}
              {step === 2 && "Career Goals"}
              {step === 3 && "Your Skills"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Define your career path"}
              {step === 3 && "Select your current skillset"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Career Goals */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Current Role *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLE_OPTIONS.map((role) => (
                      <button
                        key={role}
                        onClick={() => updateFormData('role', role)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          formData.role === role
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target Role *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TARGET_ROLE_OPTIONS.map((role) => (
                      <button
                        key={role}
                        onClick={() => updateFormData('targetRole', role)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          formData.targetRole === role
                            ? 'border-secondary bg-secondary/10 text-secondary'
                            : 'border-border hover:border-secondary/50'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Label>Select Your Skills</Label>
                  <Badge variant="secondary">
                    {formData.skills.length} selected
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => {
                    const isSelected = formData.skills.some(s => s.subject === skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white/5 border border-white/10 hover:border-primary/50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 mr-1 inline" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select at least one skill to continue. You can always update your skills later.
                </p>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button 
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                >
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        {step === 1 && (
          <p className="text-center mt-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Skip for now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}


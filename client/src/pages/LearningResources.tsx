import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Code, 
  Cloud, 
  Shield, 
  Database, 
  Palette, 
  Brain, 
  TrendingUp,
  ExternalLink,
  Search,
  Filter,
  Award,
  ChevronRight,
  GraduationCap,
  Users,
  Briefcase,
  SearchCode,
  Server,
  Lock,
  Megaphone,
  Figma,
  Building,
  FileText,
  Folder,
  Sparkles,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Course {
  title: string;
  provider: string;
  url: string;
  description: string;
  category: string;
  isFree: boolean;
  rating?: number;
}

interface ResourceCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  courses: Course[];
}

const LEARNING_RESOURCES: ResourceCategory[] = [
  {
    id: "software",
    name: "Software Developer",
    icon: Code,
    color: "text-blue-400",
    courses: [
      { title: "Full Web Development Path", provider: "freeCodeCamp", url: "https://www.freecodecamp.org", description: "1000+ hours of free coding and web development projects", category: "Web Dev", isFree: true, rating: 4.9 },
      { title: "Full-Stack Roadmap", provider: "The Odin Project", url: "https://www.theodinproject.com", description: "Free full-stack curriculum with real-world projects", category: "Full Stack", isFree: true, rating: 4.8 },
      { title: "Web Docs Fundamentals", provider: "MDN", url: "https://developer.mozilla.org", description: "Complete HTML, CSS, JavaScript documentation", category: "Web Dev", isFree: true, rating: 4.7 },
      { title: "Open Source Projects", provider: "GitHub", url: "https://github.com", description: "Contribute to open source and build portfolio", category: "Portfolio", isFree: true, rating: 4.8 },
    ]
  },
  {
    id: "data",
    name: "Data Analyst / Scientist",
    icon: Database,
    color: "text-green-400",
    courses: [
      { title: "Python & Machine Learning", provider: "Kaggle", url: "https://www.kaggle.com/learn", description: "Free Python, ML courses with real datasets", category: "ML", isFree: true, rating: 4.8 },
      { title: "Data Analytics Professional Certificate", provider: "Coursera (Google)", url: "https://www.coursera.org/professional-certificates/google-data-analytics", description: "Industry-recognized course (audit mode free)", category: "Data Analytics", isFree: true, rating: 4.7 },
      { title: "CS50 Data Science", provider: "Harvard (edX)", url: "https://www.edx.org", description: "Full university course materials free", category: "Data Science", isFree: true, rating: 4.9 },
      { title: "Data Science Projects", provider: "Kaggle", url: "https://www.kaggle.com", description: "Real datasets for practice", category: "Practice", isFree: true, rating: 4.6 },
    ]
  },
  {
    id: "cloud",
    name: "Cloud Engineer",
    icon: Cloud,
    color: "text-cyan-400",
    courses: [
      { title: "AWS Free Training", provider: "Amazon Web Services", url: "https://aws.amazon.com/training", description: "Free cloud training and certifications prep", category: "AWS", isFree: true, rating: 4.7 },
      { title: "Azure Learning Paths", provider: "Microsoft Learn", url: "https://learn.microsoft.com", description: "Free Azure learning paths", category: "Azure", isFree: true, rating: 4.6 },
      { title: "Google Cloud Training", provider: "Google Cloud", url: "https://cloud.google.com/training", description: "Free cloud skills boost program", category: "GCP", isFree: true, rating: 4.7 },
    ]
  },
  {
    id: "security",
    name: "Cybersecurity",
    icon: Shield,
    color: "text-red-400",
    courses: [
      { title: "Cybersecurity Courses", provider: "Cisco Academy", url: "https://www.netacad.com", description: "Free cybersecurity courses and certifications", category: "Security", isFree: true, rating: 4.6 },
      { title: "Security Resources", provider: "OWASP", url: "https://owasp.org", description: "Security resources and practice labs", category: "App Security", isFree: true, rating: 4.8 },
      { title: "Security Best Practices", provider: "OWASP", url: "https://owasp.org/www-project-web-security-testing-guide/", description: "Web security testing guide", category: "Testing", isFree: true, rating: 4.7 },
    ]
  },
  {
    id: "marketing",
    name: "Digital Marketing",
    icon: Megaphone,
    color: "text-purple-400",
    courses: [
      { title: "Digital Marketing Fundamentals", provider: "Google Digital Garage", url: "https://learndigital.withgoogle.com", description: "Free digital marketing certification", category: "Marketing", isFree: true, rating: 4.5 },
      { title: "Inbound Marketing", provider: "HubSpot Academy", url: "https://academy.hubspot.com", description: "Free marketing courses and certifications", category: "Marketing", isFree: true, rating: 4.7 },
    ]
  },
  {
    id: "design",
    name: "UI/UX Designer",
    icon: Palette,
    color: "text-pink-400",
    courses: [
      { title: "Figma Free Plan", provider: "Figma", url: "https://www.figma.com", description: "Free design tool for UI/UX", category: "Design Tools", isFree: true, rating: 4.8 },
      { title: "Design Resources", provider: "Interaction Design Foundation", url: "https://www.interaction-design.org", description: "Some free design courses and resources", category: "UX Design", isFree: true, rating: 4.6 },
    ]
  },
  {
    id: "placements",
    name: "Placement Prep / CS Fundamentals",
    icon: Brain,
    color: "text-amber-400",
    courses: [
      { title: "Practice Problems", provider: "GeeksforGeeks", url: "https://www.geeksforgeeks.org", description: "Complete computer science topics and practice", category: "DSA", isFree: true, rating: 4.7 },
      { title: "Coding Practice", provider: "LeetCode", url: "https://leetcode.com", description: "Coding interview preparation platform", category: "Interviews", isFree: true, rating: 4.8 },
      { title: "Programming Contests", provider: "CodeChef", url: "https://www.codechef.com", description: "Competitive programming practice", category: "DSA", isFree: true, rating: 4.5 },
      { title: "DSA Courses", provider: "FreeCodeCamp", url: "https://www.freecodecamp.org/news/free-data-structures-and-algorithms-course/", description: "Free DSA course", category: "DSA", isFree: true, rating: 4.6 },
    ]
  },
  {
    id: "government",
    name: "Govt Jobs (India)",
    icon: Building,
    color: "text-orange-400",
    courses: [
      { title: "UPSC Official", provider: "UPSC", url: "https://upsc.gov.in", description: "Union Public Service Commission exams", category: "Civil Services", isFree: true, rating: 4.8 },
      { title: "SSC Official", provider: "SSC", url: "https://ssc.nic.in", description: "Staff Selection Commission exams", category: "Jobs", isFree: true, rating: 4.6 },
      { title: "NTA", provider: "National Testing Agency", url: "https://nta.ac.in", description: "Various entrance exams", category: "Entrance", isFree: true, rating: 4.5 },
    ]
  },
  {
    id: "datasets",
    name: "Open Datasets",
    icon: Folder,
    color: "text-teal-400",
    courses: [
      { title: "Kaggle Datasets", provider: "Kaggle", url: "https://www.kaggle.com/datasets", description: "Thousands of free datasets", category: "Data", isFree: true, rating: 4.8 },
      { title: "UCI Repository", provider: "UCI ML Repository", url: "https://archive.ics.uci.edu", description: "Machine learning datasets", category: "ML Data", isFree: true, rating: 4.7 },
    ]
  }
];

const MOOC_PLATFORMS = [
  { name: "Coursera", url: "https://www.coursera.org/resources", description: "Free career tools & courses (audit mode)", icon: GraduationCap },
  { name: "Alison", url: "https://alison.com/learning/courses", description: "Free courses on business, tech, marketing", icon: BookOpen },
  { name: "OpenLearn", url: "https://www.open.edu/openlearn/work-skills", description: "Free work skills courses", icon: Award },
  { name: "GCFGlobal", url: "https://edu.gcfglobal.org", description: "Free tech & job training", icon: Code },
  { name: "Academic Earth", url: "https://academicearth.org", description: "Free university lectures", icon: GraduationCap },
  { name: "Skillslex", url: "https://skillslex.com/courses.html", description: "Free career courses & paths", icon: Briefcase },
  { name: "SkillUply", url: "https://www.skilluply.life/resources", description: "Free career tools & learning", icon: TrendingUp },
  { name: "OER Commons", url: "https://www.oercommons.org", description: "Open educational resources", icon: BookOpen },
];

export default function LearningResources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredResources = LEARNING_RESOURCES.map(category => ({
    ...category,
    courses: category.courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    selectedCategory === "all" || category.id === selectedCategory
  );

  const allCourses = filteredResources.flatMap(cat => cat.courses);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">Learning Resources</h1>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Curated Free
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Free open-source courses and resources for your career journey
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses, platforms, topics..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Links - MOOC Platforms */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Free Course Platforms
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOOC_PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <platform.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{platform.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{platform.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {LEARNING_RESOURCES.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="gap-1"
              >
                <category.icon className={`w-4 h-4 ${category.color}`} />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Course Cards */}
          {selectedCategory === "all" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCourses.map((course, idx) => (
                <a
                  key={idx}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                        {course.isFree && (
                          <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                            Free
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {course.provider}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {course.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                        )}
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            filteredResources.filter(cat => cat.courses.length > 0).map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.courses.map((course, idx) => (
                    <a
                      key={idx}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer group">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                            {course.isFree && (
                              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                Free
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {course.provider}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {course.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-medium">{course.rating}</span>
                              </div>
                            )}
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </TabsContent>
            ))
          )}
        </Tabs>

        {/* Tips Section */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Pro Tips for Success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50">
              <h4 className="font-medium mb-2">🎯 Focus on Skills Employers Want</h4>
              <p className="text-sm text-muted-foreground">
                Coding (HTML, CSS, Python, SQL), Cloud fundamentals (AWS, Azure), Digital Marketing, Soft skills
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <h4 className="font-medium mb-2">📁 Build Projects & Portfolio</h4>
              <p className="text-sm text-muted-foreground">
                Not just certificates — build real projects to impress recruiters
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <h4 className="font-medium mb-2">🔍 Use Career Planning Tools</h4>
              <p className="text-sm text-muted-foreground">
                Explore career quizzes on Coursera & Skillslex to choose the right field
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


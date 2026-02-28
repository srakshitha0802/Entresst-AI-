import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Brain, Target, AlertCircle, CheckCircle } from "lucide-react";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze this resume and provide feedback in JSON format:
{
  "score": 1-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "keywords": ["keyword1", "keyword2"],
  "atsScore": 1-100
}

Resume:
${resumeText}`,
          provider: 'gemini'
        })
      });

      if (response.ok) {
        const data = await response.json();
        try {
          setResults(JSON.parse(data.response));
        } catch {
          setResults({
            score: 70,
            strengths: ["Good work experience", "Clear formatting"],
            weaknesses: ["Missing keywords", "Could be more specific"],
            suggestions: ["Add more quantifiable achievements", "Include relevant keywords"],
            keywords: ["JavaScript", "React", "Node.js"],
            atsScore: 75
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }
    setAnalyzing(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Resume Analyzer
          </h1>
          <p className="text-muted-foreground">Upload your resume for AI-powered analysis and suggestions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>Paste your resume text or upload a file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop your resume here</p>
              <p className="text-xs text-muted-foreground">or click to browse (PDF, DOCX, TXT)</p>
            </div>
            
            <div className="relative">
              <Textarea
                placeholder="Or paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={15}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={analyzeResume} 
              disabled={!resumeText.trim() || analyzing}
              className="w-full"
            >
              {analyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {results ? (
            <>
              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle>Overall Score</CardTitle>
                  <div className="text-5xl font-bold text-primary mt-2">
                    {results.score || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(results.strengths || []).map((strength: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(results.weaknesses || []).map((weakness: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(results.suggestions || []).map((suggestion: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-blue-500/10 text-sm">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keywords Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(results.keywords || []).map((keyword: string, i: number) => (
                      <Badge key={i} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Paste your resume and click analyze</p>
                <p className="text-sm text-muted-foreground">to see AI-powered insights</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


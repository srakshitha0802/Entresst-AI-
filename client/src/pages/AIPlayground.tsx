import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, BarChart3, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIResponse {
  provider: 'gemini' | 'openai' | 'huggingface';
  response: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export default function AIPlayground() {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'huggingface'>('gemini');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const { toast } = useToast();

  const generateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider, model: model || undefined }),
      });

      if (!response.ok) throw new Error('Failed to generate response');
      
      const data: AIResponse = await response.json();
      setResponses([data]);
      
      toast({
        title: 'Success',
        description: `Generated response using ${data.provider}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const compareProviders = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to compare providers');
      
      const data: AIResponse[] = await response.json();
      setResponses(data);
      
      toast({
        title: 'Success',
        description: `Compared responses from ${data.length} providers`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to compare providers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setImageLoading(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate image');
      
      const data = await response.json();
      setImageUrl(data.imageUrl);
      
      toast({
        title: 'Success',
        description: 'Image generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Playground</h1>
          <p className="text-muted-foreground">Test and compare different AI providers</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Real API Integration
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Generation
            </CardTitle>
            <CardDescription>
              Enter a prompt and choose your AI provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Prompt</label>
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="huggingface">HuggingFace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Model (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., gpt-4"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateText} 
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
              <Button 
                onClick={compareProviders} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <BarChart3 className="mr-2 h-4 w-4" />
                Compare All
              </Button>
            </div>

            <Button 
              onClick={generateImage} 
              disabled={imageLoading}
              variant="secondary"
              className="w-full"
            >
              {imageLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Image
            </Button>
          </CardContent>
        </Card>

        {/* Image Generation Result */}
        {imageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={imageUrl} 
                alt="Generated" 
                className="w-full rounded-lg shadow-md"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Responses Section */}
      {responses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Responses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {responses.map((response, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{response.provider}</span>
                    <Badge variant={response.provider === 'gemini' ? 'default' : 'secondary'}>
                      {response.provider}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{response.response}</p>
                  {response.usage && (
                    <div className="mt-4 text-xs text-muted-foreground">
                      <div>Tokens: {response.usage.total_tokens}</div>
                      <div>Prompt: {response.usage.prompt_tokens}</div>
                      <div>Completion: {response.usage.completion_tokens}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

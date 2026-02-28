import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Database, Save, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StorageItem {
  id?: string;
  timestamp?: string;
  [key: string]: any;
}

export default function StorageDemo() {
  const [data, setData] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState('user_profiles');
  const [newItem, setNewItem] = useState({ title: '', content: '' });
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/storage/${collection}`);
      if (!response.ok) throw new Error('Failed to load data');
      
      const result = await response.json();
      setData(Array.isArray(result) ? result : [result]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    if (!newItem.title || !newItem.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/storage/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error('Failed to save data');
      
      const result = await response.json();
      setData(prev => [...prev, result]);
      setNewItem({ title: '', content: '' });
      
      toast({
        title: 'Success',
        description: 'Data saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64 = base64Data.split(',')[1]; // Remove data URL prefix

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64,
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!response.ok) throw new Error('Failed to upload file');
        
        const result = await response.json();
        
        toast({
          title: 'Success',
          description: `File uploaded: ${result.url}`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [collection]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Storage</h1>
          <p className="text-muted-foreground">Manage your data with cloud storage</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Free Storage
        </Badge>
      </div>

      <Tabs defaultValue="data" className="space-y-6">
        <TabsList>
          <TabsTrigger value="data">Data Storage</TabsTrigger>
          <TabsTrigger value="files">File Upload</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Save Data Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Data
                </CardTitle>
                <CardDescription>
                  Store data in the cloud for free
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Collection</label>
                  <Input
                    placeholder="Collection name"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Enter title"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Enter content"
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={saveData} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save to Storage
                </Button>
              </CardContent>
            </Card>

            {/* View Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Stored Data
                </CardTitle>
                <CardDescription>
                  View data from collection: {collection}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={loadData} 
                  disabled={loading}
                  variant="outline"
                  className="mb-4"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Download className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No data found in this collection
                    </p>
                  ) : (
                    data.map((item, index) => (
                      <Card key={item.id || index} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.timestamp && (
                            <Badge variant="outline" className="text-xs">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.content}</p>
                        {item.id && (
                          <p className="text-xs text-muted-foreground mt-2">ID: {item.id}</p>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload
              </CardTitle>
              <CardDescription>
                Upload files to free cloud storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Upload Files</p>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here, or click to select
                </p>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button disabled={loading} asChild>
                    <span>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Collections</CardTitle>
              <CardDescription>
                Pre-configured collections for different data types
              </CardDescription>
            </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'user_profiles', desc: 'User profile information' },
                  { name: 'user_skills', desc: 'Skills assessment data' },
                  { name: 'user_statistics', desc: 'User statistics & metrics' },
                  { name: 'ai_generations', desc: 'AI text generations' },
                  { name: 'ai_recommendations', desc: 'AI-powered recommendations' },
                  { name: 'market_demand', desc: 'Market demand data' },
                ].map((col) => (
                  <Card
                    key={col.name}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setCollection(col.name)}
                  >
                    <h4 className="font-medium mb-1">{col.name}</h4>
                    <p className="text-sm text-muted-foreground">{col.desc}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

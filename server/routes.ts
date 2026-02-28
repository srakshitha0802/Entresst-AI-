import type { Express } from "express";
import { createServer, type Server } from "http";
import { AIService } from "./services/ai";
import { getStorageService, storageServicePromise, configuredServices, isStorageConfigured } from "./services/storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Wait for storage service to be fully initialized before registering routes
  const storageService = await storageServicePromise;
  
  if (!storageService) {
    throw new Error('Storage service failed to initialize');
  }
  
  console.log('Storage service ready, registering routes...');
  
  // Generate text with specific AI provider
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, provider, model } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      let result;
      switch (provider) {
        case 'gemini':
          result = await AIService.geminiGenerate(prompt);
          break;
        case 'openai':
          result = await AIService.openaiGenerate(prompt, model);
          break;
        case 'huggingface':
          result = await AIService.huggingfaceGenerate(prompt, model);
          break;
        default:
          return res.status(400).json({ error: 'Invalid provider. Use: gemini, openai, or huggingface' });
      }

      // Save to storage
      await storageService.saveData('ai_generations', {
        prompt,
        provider,
        response: result.response,
        timestamp: new Date().toISOString()
      });

      res.json(result);
    } catch (error) {
      console.error('AI Generation Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Compare all AI providers
  app.post('/api/ai/compare', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const results = await AIService.compareResponses(prompt);

      // Save comparison to storage
      await storageService.saveData('ai_comparisons', {
        prompt,
        responses: results,
        timestamp: new Date().toISOString()
      });

      res.json(results);
    } catch (error) {
      console.error('AI Comparison Error:', error);
      res.status(500).json({ 
        error: 'Failed to compare responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate image
  app.post('/api/ai/generate-image', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const imageUrl = await AIService.generateImage(prompt);

      // Save image generation to storage
      await storageService.saveData('image_generations', {
        prompt,
        imageUrl,
        timestamp: new Date().toISOString()
      });

      res.json({ imageUrl });
    } catch (error) {
      console.error('Image Generation Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Storage API Routes
  
  // Get saved data
  app.get('/api/storage/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const { id } = req.query;
      
      const data = id 
        ? await storageService.getData(collection, id as string)
        : await storageService.getData(collection);
      
      res.json(data);
    } catch (error) {
      console.error('Storage Get Error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Save data
  app.post('/api/storage/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const data = req.body;
      
      const result = await storageService.saveData(collection, {
        ...data,
        timestamp: new Date().toISOString()
      });
      
      res.json(result);
    } catch (error) {
      console.error('Storage Save Error:', error);
      res.status(500).json({ 
        error: 'Failed to save data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Upload file
  app.post('/api/storage/upload', async (req, res) => {
    try {
      // Note: This would need multer or similar for file uploads
      // For now, we'll accept base64 data
      const { fileData, filename, contentType } = req.body;
      
      if (!fileData || !filename) {
        return res.status(400).json({ error: 'File data and filename are required' });
      }

      const buffer = Buffer.from(fileData, 'base64');
      const url = await storageService.uploadFile(buffer, filename, contentType || 'application/octet-stream');
      
      res.json({ url });
    } catch (error) {
      console.error('File Upload Error:', error);
      res.status(500).json({ 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: {
        gemini: !!process.env.GEMINI_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        huggingface: !!process.env.HUGGINGFACE_API_KEY,
        supabase: configuredServices.supabase,
        mongodb: configuredServices.mongodb,
        firebase: configuredServices.firebase,
        storageConfigured: isStorageConfigured
      }
    });
  });

  // Update User Profile
  app.post('/api/user/profile', async (req, res) => {
    try {
      const profileData = req.body;
      
      // Save user profile to storage
      const result = await storageService.saveData('user_profiles', {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      res.json({ success: true, profile: result });
    } catch (error) {
      console.error('Profile Update Error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // User Profile API - Real data from storage
  app.get('/api/user/profile', async (req, res) => {
    try {
      // Fetch user profile from storage
      const profiles = await storageService.getData('user_profiles');
      if (profiles && profiles.length > 0) {
        // Return most recent profile
        const profile = profiles[0];
        res.json({
          id: profile.id || 'user-001',
          name: profile.name || 'User',
          email: profile.email || '',
          role: profile.role || '',
          targetRole: profile.targetRole || '',
          joinedDate: profile.joinedDate || new Date().toISOString(),
          lastActive: new Date().toISOString()
        });
      } else {
        // No profile exists - return empty to trigger onboarding
        res.json(null);
      }
    } catch (error) {
      console.error('Profile Fetch Error:', error);
      res.json(null);
    }
  });

  // Check if user is initialized
  app.get('/api/initialization', async (req, res) => {
    try {
      let hasProfile = false;
      let hasUsers = false;
      
      // Check for user profile first (full onboarding complete)
      try {
        const profiles = await storageService.getData('user_profiles');
        hasProfile = profiles && Array.isArray(profiles) && profiles.length > 0;
      } catch (profileError) {
        console.log('Could not check user_profiles:', profileError);
      }
      
      // Also check for any users (for authentication)
      try {
        const users = await storageService.getData('users');
        hasUsers = users && Array.isArray(users) && users.length > 0;
      } catch (userError) {
        console.log('Could not check users:', userError);
      }
      
      // User is initialized if they have either:
      // 1. A complete user profile (full onboarding), OR
      // 2. At least one user account exists (auth is set up)
      const isInitialized = hasProfile || hasUsers;
      
      res.json({ 
        isInitialized,
        hasProfile,
        hasUsers,
        message: hasProfile ? 'User profile exists' : hasUsers ? 'User account exists but profile not set up' : 'No user found'
      });
    } catch (error) {
      console.error('Initialization Check Error:', error);
      // Even on error, try to check if any users exist for backward compatibility
      try {
        const users = await storageService.getData('users');
        const hasUsers = users && Array.isArray(users) && users.length > 0;
        res.json({ 
          isInitialized: hasUsers,
          hasProfile: false,
          hasUsers,
          message: hasUsers ? 'User account exists' : 'No user found (error)'
        });
      } catch {
        res.json({ isInitialized: false, hasProfile: false, hasUsers: false, error: 'Failed to check initialization' });
      }
    }
  });

  // Profile Setup - Create initial profile
  app.post('/api/user/profile-setup', async (req, res) => {
    try {
      const { name, email, role, targetRole, skills } = req.body;
      
      if (!name || !email || !role || !targetRole) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      const profile = {
        name,
        email,
        role,
        targetRole,
        joinedDate: new Date().toISOString(),
        isOnboarded: true
      };

      // Save user profile
      const savedProfile = await storageService.saveData('user_profiles', profile);

      // Convert skills to the format needed for skills API
      if (skills && Array.isArray(skills)) {
        const skillData = skills.map((skill: { subject: string; level: number }) => ({
          subject: skill.subject,
          A: skill.level || 50,
          fullMark: 150
        }));
        
        for (const skill of skillData) {
          await storageService.saveData('user_skills', skill);
        }
      }

      // Generate initial statistics based on skills
      const stats = {
        roleMatch: 65,
        skillGaps: skills ? Math.max(0, 5 - Math.floor(skills.length / 5)) : 5,
        marketGrowth: Math.floor(Math.random() * 15) + 10,
        certificationsDue: 0
      };
      await storageService.saveData('user_statistics', stats);

      // Generate AI recommendations based on target role
      const recommendations = [
        { title: `Learn ${targetRole} fundamentals`, type: "Course", urgency: "High", description: `Start building skills for ${targetRole} role` },
        { title: "Build relevant projects", type: "Project", urgency: "High", description: "Create portfolio projects that demonstrate your target role skills" },
        { title: "Research industry trends", type: "Research", urgency: "Medium", description: "Stay updated with latest technologies in your target field" }
      ];

      for (const rec of recommendations) {
        await storageService.saveData('ai_recommendations', rec);
      }

      res.json({ success: true, profile: savedProfile });
    } catch (error) {
      console.error('Profile Setup Error:', error);
      res.status(500).json({ error: 'Failed to create profile' });
    }
  });

  // Skills API - Real skills data from storage
  app.get('/api/skills', async (req, res) => {
    try {
      // Fetch skills from storage
      const skillsData = await storageService.getData('user_skills');
      if (skillsData && skillsData.length > 0) {
        // Return stored skills
        res.json(skillsData);
      } else {
        // No skills exist - return empty array to trigger onboarding prompt
        res.json([]);
      }
    } catch (error) {
      console.error('Skills Fetch Error:', error);
      res.json([]);
    }
  });

  // Update User Skills
  app.post('/api/skills', async (req, res) => {
    try {
      const { skills } = req.body;
      
      if (!Array.isArray(skills)) {
        return res.status(400).json({ error: 'Skills must be an array' });
      }
      
      // Clear existing skills and save new ones
      for (const skill of skills) {
        await storageService.saveData('user_skills', skill);
      }
      
      res.json({ success: true, skills });
    } catch (error) {
      console.error('Skills Update Error:', error);
      res.status(500).json({ error: 'Failed to update skills' });
    }
  });

  // Statistics API - Real statistics from storage
  app.get('/api/statistics', async (req, res) => {
    try {
      // Fetch statistics from storage
      const statsData = await storageService.getData('user_statistics');
      if (statsData && statsData.length > 0) {
        // Return stored statistics
        res.json(statsData[0]);
      } else {
        // No statistics yet - user needs to set up profile first
        res.json(null);
      }
    } catch (error) {
      console.error('Statistics Fetch Error:', error);
      res.json(null);
    }
  });

  // Market Demand API - Real market data from storage
  app.get('/api/market/demand', async (req, res) => {
    try {
      // Fetch market demand from storage
      const demandData = await storageService.getData('market_demand');
      if (demandData && demandData.length > 0) {
        // Return stored market data
        res.json(demandData);
      } else {
        // No market data yet - user needs to set up profile first
        res.json([]);
      }
    } catch (error) {
      console.error('Market Demand Fetch Error:', error);
      res.json([]);
    }
  });

  // AI Recommendations API - Dynamic recommendations from AI and storage
  app.get('/api/recommendations', async (req, res) => {
    try {
      // Fetch recommendations from storage
      const storedRecs = await storageService.getData('ai_recommendations');
      if (storedRecs && storedRecs.length > 0) {
        // Return stored recommendations
        res.json(storedRecs);
      } else {
        // No recommendations yet - generate based on user profile
        const profile = await storageService.getData('user_profiles');
        
        let targetRole = 'Senior Full Stack Developer';
        if (profile && profile.length > 0 && profile[0].targetRole) {
          targetRole = profile[0].targetRole;
        }
        
        // Try to use AI to generate personalized recommendations
        try {
          const prompt = `Generate 3 personalized career recommendations for someone aiming to become a ${targetRole}. 
          Format as JSON array with fields: title (string), type (string - Course/Project/Certification), urgency (string - High/Medium), description (string).
          Keep it concise and actionable.`;
          
          const result = await AIService.geminiGenerate(prompt);
          
          // Parse the JSON response
          try {
            const recommendations = JSON.parse(result.response);
            // Save to storage
            for (const rec of recommendations) {
              await storageService.saveData('ai_recommendations', rec);
            }
            res.json(recommendations);
          } catch {
            // If parsing fails, return default structure
            const defaultRecs = [
              { title: `Learn ${targetRole} fundamentals`, type: "Course", urgency: "High", description: `Start building skills for ${targetRole} role` },
              { title: "Build relevant projects", type: "Project", urgency: "High", description: "Create portfolio projects that demonstrate your target role skills" },
              { title: "Research industry trends", type: "Research", urgency: "Medium", description: "Stay updated with latest technologies in your target field" }
            ];
            for (const rec of defaultRecs) {
              await storageService.saveData('ai_recommendations', rec);
            }
            res.json(defaultRecs);
          }
        } catch (aiError) {
          console.error('AI Generation Error - using offline recommendations:', aiError);
          // Provide offline recommendations when AI fails
          const offlineRecs = [
            { title: `Learn ${targetRole} fundamentals`, type: "Course", urgency: "High", description: `Start building skills for ${targetRole} role` },
            { title: "Build relevant projects", type: "Project", urgency: "High", description: "Create portfolio projects that demonstrate your target role skills" },
            { title: "Research industry trends", type: "Research", urgency: "Medium", description: "Stay updated with latest technologies in your target field" }
          ];
          for (const rec of offlineRecs) {
            await storageService.saveData('ai_recommendations', rec);
          }
          res.json(offlineRecs);
        }
      }
    } catch (error) {
      console.error('Recommendations Fetch Error:', error);
      res.json([]);
    }
  });

  // AI Chat API - Real AI-powered chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Try AI service to generate response, fall back to template if fails
      try {
        // Use AI service to generate response
        const prompt = `You are a career advisor AI. The user is asking: "${message}". 
        Provide helpful, concise career guidance. Focus on skill development and career growth.`;
        
        const result = await AIService.geminiGenerate(prompt);
        
        res.json({
          role: 'assistant',
          content: result.response,
          timestamp: new Date().toISOString()
        });
      } catch (aiError) {
        console.error('AI Chat Error - using fallback:', aiError);
        // Provide a helpful fallback response
        const fallbackResponses = [
          "I'd be happy to help with your career development! While my AI capabilities are temporarily limited, I can still guide you through setting up your profile and exploring career paths. Would you like to complete your profile setup?",
          "Great question about your career! To provide the best personalized advice, please complete your profile setup first. This will help me understand your current skills and goals.",
          "I'm here to help! For personalized career recommendations, please set up your profile with your current role, target role, and skills. This will enable me to provide tailored guidance."
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.json({
          role: 'assistant',
          content: randomResponse,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Chat Error:', error);
      res.status(500).json({ 
        error: 'Failed to get response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Quiz Results API
  app.post('/api/quiz/results', async (req, res) => {
    try {
      const { category, score, maxScore, percentage, answers } = req.body;
      
      const result = await storageService.saveData('quiz_results', {
        category,
        score,
        maxScore,
        percentage,
        answers,
        completedAt: new Date().toISOString()
      });
      
      res.json({ success: true, result });
    } catch (error) {
      console.error('Quiz Results Error:', error);
      res.status(500).json({ error: 'Failed to save quiz results' });
    }
  });

  // Dynamic Quiz Question Generation - AI-powered adaptive questions
  app.post('/api/ai/quiz-question', async (req, res) => {
    try {
      const { category, difficulty, topic, userSkillLevel, previousPerformance } = req.body;
      
      // Build a context-aware prompt based on user profile
      const skillContext = userSkillLevel ? `The user's skill level is: ${userSkillLevel}.` : '';
      const performanceContext = previousPerformance ? `Their recent performance: ${previousPerformance.correct} correct out of ${previousPerformance.total} questions.` : '';
      
      const prompt = `Generate a single ${difficulty || 'medium'}-difficulty multiple-choice quiz question for ${category || 'Software Development'}.
${topic ? `Focus on this topic: ${topic}.` : ''}
${skillContext}
${performanceContext}

Respond ONLY with valid JSON in this exact format:
{
  "id": "unique-question-id",
  "question": "The question text",
  "options": [
    { "value": "a", "label": "Option A text", "correct": false },
    { "value": "b", "label": "Option B text", "correct": true },
    { "value": "c", "label": "Option C text", "correct": false },
    { "value": "d", "label": "Option D text", "correct": false }
  ],
  "category": "technical",
  "difficulty": "${difficulty || 'medium'}",
  "explanation": "Brief explanation of why the correct answer is right",
  "topic": "${topic || category || 'General'}"
}

Make sure exactly ONE option has "correct": true.
Ensure the question is relevant to real-world software development scenarios.`;

      const result = await AIService.geminiGenerate(prompt);
      
      // Parse the JSON response
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const questionData = JSON.parse(jsonMatch[0]);
          res.json(questionData);
        } else {
          throw new Error('No valid JSON found');
        }
      } catch (parseError) {
        console.error('Failed to parse AI quiz question:', parseError);
        // Return a fallback question
        res.json({
          id: `fallback-${Date.now()}`,
          question: `What is a key principle of ${category || 'software development'}?`,
          options: [
            { value: "a", label: "Always write code without testing", correct: false },
            { value: "b", label: "Follow best practices and write maintainable code", correct: true },
            { value: "c", label: "Never refactor your code", correct: false },
            { value: "d", label: "Avoid using version control", correct: false }
          ],
          category: "technical",
          difficulty: difficulty || "medium",
          explanation: "Following best practices and writing maintainable code is essential for long-term project success.",
          topic: category || "Software Development"
        });
      }
    } catch (error) {
      console.error('Quiz Question Generation Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate quiz question',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Personalized Job Market Insights - AI-powered
  app.post('/api/ai/job-insights', async (req, res) => {
    try {
      const { skills, targetRole, location, experienceLevel } = req.body;
      
      // Build context for personalized insights
      const skillsContext = skills && skills.length > 0 ? `User's current skills: ${skills.join(', ')}.` : '';
      const roleContext = targetRole ? `Target role: ${targetRole}.` : '';
      const expContext = experienceLevel ? `Experience level: ${experienceLevel}.` : '';
      
      const prompt = `Generate personalized job market insights for a software professional.
${skillsContext}
${roleContext}
${expContext}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "A brief market overview paragraph",
  "topRoles": [
    { "role": "Role Name", "demand": 95, "growth": 15, "avgSalary": 110000, "locations": ["City1", "City2"] }
  ],
  "skillGaps": [
    { "skill": "Skill Name", "demand": 90, "why": "Why this skill is in demand" }
  ],
  "recommendations": [
    { "title": "Recommendation title", "priority": "high", "reason": "Why this matters" }
  ],
  "salaryByExperience": [
    { "level": "Entry", "salary": 65000 },
    { "level": "Senior", "salary": 120000 }
  ],
  "marketTrends": [
    { "trend": "Trend description", "impact": "positive", "percentage": 25 }
  ]
}

Use realistic current market data. Ensure salary numbers are reasonable for the industry.`;

      const result = await AIService.geminiGenerate(prompt);
      
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const insightsData = JSON.parse(jsonMatch[0]);
          // Cache this result
          await storageService.saveData('job_insights_cache', {
            skills,
            targetRole,
            insights: insightsData,
            generatedAt: new Date().toISOString()
          });
          res.json(insightsData);
        } else {
          throw new Error('No valid JSON found');
        }
      } catch (parseError) {
        console.error('Failed to parse AI job insights:', parseError);
        // Return fallback data
        res.json({
          summary: "The tech job market continues to grow with strong demand for full-stack developers and AI/ML specialists.",
          topRoles: [
            { role: "Full Stack Developer", demand: 95, growth: 18, avgSalary: 110000, locations: ["Remote", "San Francisco", "New York"] },
            { role: "Frontend Developer", demand: 92, growth: 15, avgSalary: 95000, locations: ["Remote", "Austin", "Seattle"] }
          ],
          skillGaps: [
            { skill: "TypeScript", demand: 90, why: "Industry standard for type-safe JavaScript" },
            { skill: "Cloud/AWS", demand: 88, why: "Essential for modern deployment" }
          ],
          recommendations: [
            { title: "Learn TypeScript", priority: "high", reason: "High demand in current market" },
            { title: "Build cloud deployment skills", priority: "high", reason: "Essential for modern development" }
          ],
          salaryByExperience: [
            { level: "Entry (0-2 yrs)", salary: 65000 },
            { level: "Mid (4-6 yrs)", salary: 110000 },
            { level: "Senior (8+ yrs)", salary: 150000 }
          ],
          marketTrends: [
            { trend: "AI integration in all roles", impact: "positive", percentage: 30 },
            { trend: "Remote work standardization", impact: "positive", percentage: 20 }
          ]
        });
      }
    } catch (error) {
      console.error('Job Insights Generation Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate job insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Feedback Loop - Track user interactions
  app.post('/api/feedback/track', async (req, res) => {
    try {
      const { eventType, data, timestamp } = req.body;
      
      if (!eventType) {
        return res.status(400).json({ error: 'Event type is required' });
      }

      // Store the feedback/interaction
      const feedbackEntry = {
        eventType,
        data,
        timestamp: timestamp || new Date().toISOString(),
        sessionId: req.body.sessionId || 'anonymous'
      };

      await storageService.saveData('user_feedback', feedbackEntry);

      // Check if we should adapt based on this feedback
      let adaptation = null;
      
      if (eventType === 'quiz_answer') {
        // Track quiz performance for adaptive difficulty
        const quizStats = await storageService.getData('quiz_performance_stats');
        const currentStats = quizStats && quizStats.length > 0 ? quizStats[0] : { correct: 0, total: 0, recentDifficulties: [] };
        
        const isCorrect = data?.correct || false;
        const newStats = {
          correct: currentStats.correct + (isCorrect ? 1 : 0),
          total: currentStats.total + 1,
          recentDifficulties: [...(currentStats.recentDifficulties || []), data?.difficulty || 'medium'].slice(-5)
        };
        
        await storageService.saveData('quiz_performance_stats', newStats);
        
        // Determine next difficulty based on performance
        const accuracy = newStats.correct / newStats.total;
        if (accuracy > 0.8 && newStats.recentDifficulties.length >= 3) {
          adaptation = { nextDifficulty: 'hard', reason: 'User performing well, increasing difficulty' };
        } else if (accuracy < 0.5 && newStats.recentDifficulties.length >= 3) {
          adaptation = { nextDifficulty: 'easy', reason: 'User struggling, reducing difficulty' };
        }
      }

      if (eventType === 'time_on_question') {
        // Track time spent - if > 30 seconds, add hint to next question
        if (data?.timeSpent > 30000) {
          adaptation = { addHint: true, reason: 'User spent significant time on question' };
        }
      }

      res.json({ success: true, adaptation });
    } catch (error) {
      console.error('Feedback Tracking Error:', error);
      res.status(500).json({ error: 'Failed to track feedback' });
    }
  });

  // Get personalized context for AI prompts based on user history
  app.get('/api/feedback/user-context', async (req, res) => {
    try {
      // Get quiz performance
      const quizStats = await storageService.getData('quiz_performance_stats');
      
      // Get recent feedback
      const recentFeedback = await storageService.getData('user_feedback');
      
      // Get user profile
      const profile = await storageService.getData('user_profiles');
      
      // Get quiz history
      const quizHistory = await storageService.getData('quiz_results');
      
      const context = {
        performance: quizStats && quizStats.length > 0 ? quizStats[0] : null,
        recentFeedback: recentFeedback ? recentFeedback.slice(-10) : [],
        profile: profile && profile.length > 0 ? profile[0] : null,
        quizHistory: quizHistory ? quizHistory.slice(-5) : []
      };
      
      res.json(context);
    } catch (error) {
      console.error('User Context Error:', error);
      res.json({ error: 'Failed to get user context' });
    }
  });

  // Get Quiz History
  app.get('/api/quiz/history', async (req, res) => {
    try {
      const results = await storageService.getData('quiz_results');
      res.json(results || []);
    } catch (error) {
      console.error('Quiz History Error:', error);
      res.json([]);
    }
  });

  // Auth Routes
  
  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUsers = await storageService.getData('users');
      const existing = existingUsers?.find((u: any) => u.email === email);
      
      if (existing) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create new user (in production, hash the password!)
      const user = await storageService.saveData('users', {
        email,
        password, // In production: await bcrypt.hash(password, 10)
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString()
      });

      // Generate simple token (in production, use JWT)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const users = await storageService.getData('users');
      const user = users?.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate simple token
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Demo Login
  app.post('/api/auth/demo', async (req, res) => {
    try {
      // Check if demo user exists
      let users = await storageService.getData('users');
      let demoUser = users?.find((u: any) => u.email === 'demo@entresst.com');
      
      if (!demoUser) {
        demoUser = await storageService.saveData('users', {
          email: 'demo@entresst.com',
          password: 'demo123',
          name: 'Demo User',
          isDemo: true,
          createdAt: new Date().toISOString()
        });
      }

      const token = Buffer.from(`${demoUser.id}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        token,
        user: { id: demoUser.id, email: demoUser.email, name: demoUser.name }
      });
    } catch (error) {
      console.error('Demo Login Error:', error);
      res.status(500).json({ error: 'Demo login failed' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    // In a real app, invalidate the token
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Get Current User
  app.get('/api/auth/me', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = Buffer.from(token, 'base64').toString();
      const userId = decoded.split(':')[0];

      const users = await storageService.getData('users');
      const user = users?.find((u: any) => u.id === userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Code Analysis API - Analyze code for improvements
  app.post('/api/ai/code-analysis', async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const prompt = `Analyze the following ${language || 'programming'} code and provide:
1. Time and space complexity analysis
2. Potential bugs or issues
3. Code quality improvements
4. Best practices recommendations

Code:
\`\`\`${language || ''}
${code}
\`\`\``;

      const result = await AIService.geminiGenerate(prompt);
      
      res.json({
        analysis: result.response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Code Analysis Error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze code',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Algorithm Explanation API
  app.post('/api/ai/algorithm-explain', async (req, res) => {
    try {
      const { algorithm, language } = req.body;
      
      if (!algorithm) {
        return res.status(400).json({ error: 'Algorithm name is required' });
      }

      const prompt = `Explain the "${algorithm}" algorithm in detail:
1. How it works (step by step)
2. Time and space complexity
3. When to use it
4. Real-world examples
5. Code implementation in ${language || 'JavaScript'}

Provide clear, educational explanations.`;

      const result = await AIService.geminiGenerate(prompt);
      
      res.json({
        explanation: result.response,
        algorithm: algorithm,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Algorithm Explain Error:', error);
      res.status(500).json({ 
        error: 'Failed to explain algorithm',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Interview Preparation API
  app.post('/api/ai/interview-prep', async (req, res) => {
    try {
      const { topic, role, difficulty } = req.body;
      
      const prompt = `Generate interview preparation questions for:
- Role: ${role || 'Software Engineer'}
- Topic: ${topic || 'Data Structures and Algorithms'}
- Difficulty: ${difficulty || 'Medium'}

Include:
1. 5-10 technical questions with detailed answers
2. 2-3 coding challenges
3. System design questions (if applicable)
4. Behavioral questions

Provide comprehensive, interview-ready responses.`;

      const result = await AIService.geminiGenerate(prompt);
      
      res.json({
        preparation: result.response,
        topic,
        role,
        difficulty,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Interview Prep Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate interview prep',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // System Design Assistant API
  app.post('/api/ai/system-design', async (req, res) => {
    try {
      const { system, scale, requirements } = req.body;
      
      if (!system) {
        return res.status(400).json({ error: 'System name is required' });
      }

      const prompt = `Design a scalable ${system} system.
${scale ? `- Expected scale: ${scale}` : ''}
${requirements ? `- Requirements: ${requirements}` : ''}

Provide:
1. High-level architecture
2. Key components and their responsibilities
3. Database selection and schema
4. API design
5. Scalability considerations
6. Failure handling
7. Trade-offs made

Be thorough and practical.`;

      const result = await AIService.geminiGenerate(prompt);
      
      res.json({
        design: result.response,
        system,
        scale,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('System Design Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate system design',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================
  // NEW FEATURE 1: Dynamic Project Generator
  // ============================================
  app.post('/api/ai/generate-project', async (req, res) => {
    try {
      const { skills, weakAreas, targetRole, difficulty } = req.body;
      
      const skillsContext = skills && skills.length > 0 ? `User's current skills: ${skills.join(', ')}.` : '';
      const weakAreasContext = weakAreas && weakAreas.length > 0 ? `Areas they struggle with: ${weakAreas.join(', ')}.` : '';
      
      const prompt = `Generate a personalized mini-project for someone targeting ${targetRole || 'a developer role'}.
${skillsContext}
${weakAreasContext}
${difficulty ? `Difficulty level: ${difficulty}.` : ''}

Respond ONLY with valid JSON in this exact format:
{
  "title": "Project title",
  "description": "A brief overview of what to build",
  "problemStatement": "The problem the project solves",
  "userStories": ["User story 1", "User story 2", "User story 3"],
  "techStack": ["Technology 1", "Technology 2"],
  "learningObjectives": ["What they'll learn 1", "What they'll learn 2"],
  "stretchGoals": ["Stretch goal 1", "Stretch goal 2"],
  "difficulty": "medium",
  "estimatedTime": "4-6 hours",
  "difficulty": "${difficulty || 'medium'}"
}

Make it a real-world, practical project that addresses their skill gaps.`;

      const result = await AIService.geminiGenerate(prompt);
      
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const projectData = JSON.parse(jsonMatch[0]);
          // Save to storage
          await storageService.saveData('ai_generated_projects', {
            ...projectData,
            generatedAt: new Date().toISOString(),
            targetRole
          });
          res.json(projectData);
        } else {
          throw new Error('No valid JSON found');
        }
      } catch (parseError) {
        console.error('Failed to parse AI project:', parseError);
        // Return fallback project
        res.json({
          title: "Build a Task Management App",
          description: "Create a full-featured task management application with React and Node.js",
          problemStatement: "Teams need an efficient way to manage tasks and collaborate",
          userStories: [
            "As a user, I can create new tasks",
            "As a user, I can assign tasks to team members",
            "As a user, I can set due dates and priorities"
          ],
          techStack: ["React", "Node.js", "MongoDB", "Express"],
          learningObjectives: ["Full-stack development", "REST API design", "State management"],
          stretchGoals: ["Add real-time collaboration", "Implement drag-and-drop"],
          difficulty: difficulty || "medium",
          estimatedTime: "6-8 hours"
        });
      }
    } catch (error) {
      console.error('Project Generation Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate project',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get saved projects
  app.get('/api/ai/projects', async (req, res) => {
    try {
      const projects = await storageService.getData('ai_generated_projects');
      res.json(projects || []);
    } catch (error) {
      console.error('Get Projects Error:', error);
      res.json([]);
    }
  });

  // Track project completion
  app.post('/api/ai/projects/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      await storageService.saveData('completed_projects', {
        projectId: id,
        completedAt: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Project Completion Error:', error);
      res.status(500).json({ error: 'Failed to track completion' });
    }
  });

  // ============================================
  // NEW FEATURE 2: AI Mock Interview
  // ============================================
  app.post('/api/ai/mock-interview/start', async (req, res) => {
    try {
      const { targetRole, type, difficulty } = req.body; // type: 'technical' | 'behavioral'
      
      const prompt = `Generate a single interview question for a ${targetRole || 'Software Engineer'} position.
Type: ${type || 'technical'}
Difficulty: ${difficulty || 'medium'}

Respond ONLY with valid JSON:
{
  "questionId": "unique-id",
  "question": "The interview question",
  "type": "${type || 'technical'}",
  "difficulty": "${difficulty || 'medium'}",
  "category": "Category name",
  "hints": ["Hint 1", "Hint 2"],
  "sampleAnswer": "A good answer example"
}

Make it a realistic interview question.`;

      const result = await AIService.geminiGenerate(prompt);
      
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const questionData = JSON.parse(jsonMatch[0]);
          // Store current question in session
          req.body.currentQuestion = questionData;
          res.json(questionData);
        } else {
          throw new Error('No valid JSON');
        }
      } catch {
        // Fallback question
        res.json({
          questionId: `fallback-${Date.now()}`,
          question: type === 'behavioral' 
            ? "Tell me about a time you had to deal with a difficult team member. How did you handle it?"
            : "Explain the difference between var, let, and const in JavaScript.",
          type: type || 'technical',
          difficulty: difficulty || 'medium',
          category: type === 'behavioral' ? 'Teamwork' : 'JavaScript',
          hints: ["Think of a specific example", "Focus on the resolution"],
          sampleAnswer: "I once worked with a colleague who..."
        });
      }
    } catch (error) {
      console.error('Mock Interview Error:', error);
      res.status(500).json({ error: 'Failed to generate interview question' });
    }
  });

  // Evaluate interview answer
  app.post('/api/ai/mock-interview/evaluate', async (req, res) => {
    try {
      const { question, answer, type } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      const prompt = `Evaluate this interview answer for a ${type || 'technical'} question.

Question: "${question}"
Answer: "${answer}"

Respond ONLY with valid JSON:
{
  "score": 7,
  "strengths": ["What they did well 1", "What they did well 2"],
  "improvements": ["What to improve 1", "What to improve 2"],
  "feedback": "Overall feedback paragraph",
  "clarityScore": 8,
  "correctnessScore": 6,
  "communicationScore": 7
}

Score out of 10. Be constructive and helpful.`;

      const result = await AIService.geminiGenerate(prompt);
      
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluation = JSON.parse(jsonMatch[0]);
          // Save evaluation
          await storageService.saveData('interview_evaluations', {
            question,
            answer,
            evaluation,
            evaluatedAt: new Date().toISOString()
          });
          res.json(evaluation);
        } else {
          throw new Error('No valid JSON');
        }
      } catch {
        // Fallback evaluation
        res.json({
          score: 7,
          strengths: ["Answered the core question", "Provided context"],
          improvements: ["Could give more specific examples", "Structure could be better"],
          feedback: "Good attempt! Work on providing more specific examples from your experience.",
          clarityScore: 7,
          correctnessScore: 7,
          communicationScore: 7
        });
      }
    } catch (error) {
      console.error('Evaluation Error:', error);
      res.status(500).json({ error: 'Failed to evaluate answer' });
    }
  });

  // Get interview history
  app.get('/api/ai/mock-interview/history', async (req, res) => {
    try {
      const history = await storageService.getData('interview_evaluations');
      res.json(history || []);
    } catch (error) {
      res.json([]);
    }
  });

  // ============================================
  // NEW FEATURE 3: Live Skill Market Heatmap
  // ============================================
  app.post('/api/ai/skill-heatmap', async (req, res) => {
    try {
      const { skills, targetRole } = req.body;
      
      // Fetch real job counts from a mock job API (in production, use Adzuna/Indeed API)
      // For now, we'll generate AI-powered analysis
      const skillsContext = skills && skills.length > 0 ? `Focus on these skills: ${skills.join(', ')}.` : '';
      
      const prompt = `Generate a skill demand heatmap analysis for a ${targetRole || 'Software Developer'}.
${skillsContext}

Include popular tech skills: React, Node.js, Python, AWS, TypeScript, Docker, Kubernetes, GraphQL, Machine Learning, SQL.

Respond ONLY with valid JSON:
{
  "heatmapData": [
    { "skill": "React", "demand": 95, "supply": 80, "trend": "up", "salary": 110000 },
    { "skill": "Node.js", "demand": 88, "supply": 75, "trend": "up", "salary": 105000 }
  ],
  "insights": [
    { "skill": "React", "insight": "Why it's trending" }
  ],
  "recommendations": [
    { "skill": "Skill to learn", "reason": "Why", "priority": "high" }
  ],
  "lastUpdated": "${new Date().toISOString()}"
}

Use realistic market data.`;

      const result = await AIService.geminiGenerate(prompt);
      
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const heatmapData = JSON.parse(jsonMatch[0]);
          // Cache the result
          await storageService.saveData('skill_heatmap_cache', {
            ...heatmapData,
            cachedAt: new Date().toISOString()
          });
          res.json(heatmapData);
        } else {
          throw new Error('No valid JSON');
        }
      } catch {
        // Fallback heatmap
        res.json({
          heatmapData: [
            { skill: "React", demand: 95, supply: 80, trend: "up", salary: 110000 },
            { skill: "Node.js", demand: 88, supply: 75, trend: "up", salary: 105000 },
            { skill: "Python", demand: 92, supply: 70, trend: "up", salary: 115000 },
            { skill: "AWS", demand: 85, supply: 60, trend: "up", salary: 120000 },
            { skill: "TypeScript", demand: 90, supply: 65, trend: "up", salary: 112000 },
            { skill: "Docker", demand: 80, supply: 70, trend: "stable", salary: 108000 },
            { skill: "Kubernetes", demand: 78, supply: 55, trend: "up", salary: 125000 },
            { skill: "GraphQL", demand: 75, supply: 50, trend: "up", salary: 115000 },
            { skill: "Machine Learning", demand: 82, supply: 45, trend: "up", salary: 130000 },
            { skill: "SQL", demand: 88, supply: 85, trend: "stable", salary: 100000 }
          ],
          insights: [
            { skill: "React", insight: "Dominant frontend framework with strong job market" },
            { skill: "AWS", insight: "Cloud skills increasingly essential for all roles" }
          ],
          recommendations: [
            { skill: "TypeScript", reason: "High demand, moderate supply - good opportunity", priority: "high" },
            { skill: "Kubernetes", reason: "High salary, low supply - competitive advantage", priority: "high" }
          ],
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Heatmap Error:', error);
      res.status(500).json({ error: 'Failed to generate heatmap' });
    }
  });

  // ============================================
  // NEW FEATURE 4: Adaptive Learning Path (Skill Tree)
  // ============================================
  app.post('/api/ai/skill-tree', async (req, res) => {
    try {
      const { currentSkills, targetRole, completedSkills } = req.body;
      
      const currentSkillsContext = currentSkills && currentSkills.length > 0 ? `User's current skills: ${currentSkills.join(', ')}.` : '';
      const completedContext = completedSkills && completedSkills.length > 0 ? `Skills already completed: ${completedSkills.join(', ')}.` : '';
      
      const prompt = `Generate a dynamic skill tree for someone targeting ${targetRole || 'Full Stack Developer'}.
${currentSkillsContext}
${completedContext}

Respond ONLY with valid JSON:
{
  "skillTree": {
    "nodes": [
      { 
        "id": "react-basics", 
        "skill": "React Basics", 
        "level": "beginner", 
        "status": "completed",
        "prerequisites": [],
        "position": { "x": 0, "y": 0 }
      },
      { 
        "id": "react-hooks", 
        "skill": "React Hooks", 
        "level": "intermediate", 
        "status": "available",
        "prerequisites": ["react-basics"],
        "position": { "x": 100, "y": 50 }
      }
    ],
    "connections": [
      { "from": "react-basics", "to": "react-hooks" }
    ]
  },
  "learningPath": [
    { "skill": "React Hooks", "priority": 1, "reason": "Builds on basics" },
    { "skill": "State Management", "priority": 2, "reason": "Essential for real apps" }
  ],
  "unlockedSkills": ["React Hooks", "React Router"],
  "nextMilestone": "Complete React Hooks to unlock State Management"
}

Create a visual skill tree with levels, prerequisites, and progress tracking.`;

      const result = await AIService.geminiGenerate(prompt);
      
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const treeData = JSON.parse(jsonMatch[0]);
          // Cache
          await storageService.saveData('skill_tree_cache', {
            ...treeData,
            generatedAt: new Date().toISOString()
          });
          res.json(treeData);
        } else {
          throw new Error('No valid JSON');
        }
      } catch {
        // Fallback skill tree
        res.json({
          skillTree: {
            nodes: [
              { id: "js-basics", skill: "JavaScript Basics", level: "beginner", status: completedSkills?.includes("js-basics") ? "completed" : "available", prerequisites: [], position: { x: 0, y: 0 } },
              { id: "react-basics", skill: "React Basics", level: "beginner", status: completedSkills?.includes("react-basics") ? "completed" : (currentSkills?.includes("js-basics") || !currentSkills?.length ? "available" : "locked"), prerequisites: ["js-basics"], position: { x: 150, y: 0 } },
              { id: "react-hooks", skill: "React Hooks", level: "intermediate", status: completedSkills?.includes("react-hooks") ? "completed" : (currentSkills?.includes("react-basics") ? "available" : "locked"), prerequisites: ["react-basics"], position: { x: 300, y: -50 } },
              { id: "state-management", skill: "State Management", level: "intermediate", status: completedSkills?.includes("state-management") ? "completed" : (currentSkills?.includes("react-hooks") ? "available" : "locked"), prerequisites: ["react-hooks"], position: { x: 450, y: 0 } },
              { id: "node-basics", skill: "Node.js Basics", level: "beginner", status: completedSkills?.includes("node-basics") ? "completed" : (currentSkills?.includes("js-basics") || !currentSkills?.length ? "available" : "locked"), prerequisites: ["js-basics"], position: { x: 150, y: 100 } },
              { id: "fullstack", skill: "Full Stack Project", level: "advanced", status: "locked", prerequisites: ["state-management", "node-basics"], position: { x: 600, y: 50 } }
            ],
            connections: [
              { from: "js-basics", to: "react-basics" },
              { from: "js-basics", to: "node-basics" },
              { from: "react-basics", to: "react-hooks" },
              { from: "react-hooks", to: "state-management" },
              { from: "node-basics", to: "fullstack" },
              { from: "state-management", to: "fullstack" }
            ]
          },
          learningPath: [
            { skill: "React Hooks", priority: 1, reason: "Builds on your React basics" },
            { skill: "State Management", priority: 2, reason: "Essential for real-world applications" },
            { skill: "Node.js Basics", priority: 3, reason: "Expand to full-stack development" }
          ],
          unlockedSkills: currentSkills?.includes("react-basics") ? ["React Hooks", "React Router"] : ["React Basics"],
          nextMilestone: currentSkills?.includes("react-basics") ? "Complete React Hooks to unlock State Management" : "Master JavaScript Basics to unlock React"
        });
      }
    } catch (error) {
      console.error('Skill Tree Error:', error);
      res.status(500).json({ error: 'Failed to generate skill tree' });
    }
  });

  // Update skill progress
  app.post('/api/ai/skill-tree/progress', async (req, res) => {
    try {
      const { skillId, status } = req.body;
      
      await storageService.saveData('skill_progress', {
        skillId,
        status, // 'completed', 'in-progress', 'available'
        updatedAt: new Date().toISOString()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Progress Update Error:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  });

  // ============================================
  // GAME MECHANICS: XP, Levels, Mastery
  // ============================================
  
  // Get user game stats
  app.get('/api/game/stats', async (req, res) => {
    try {
      const userStats = await storageService.getData('user_game_stats');
      const currentStats = userStats && userStats.length > 0 ? userStats[0] : {
        xp: 0,
        level: 1,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        currentStreak: 0,
        longestStreak: 0,
        topics: {},
        badges: [],
        lastActivity: null
      };
      res.json(currentStats);
    } catch (error) {
      res.json({ xp: 0, level: 1 });
    }
  });

  // Submit answer and calculate XP
  app.post('/api/game/submit-answer', async (req, res) => {
    try {
      const { topic, difficulty, isCorrect, timeSpent, hintsUsed, questionId } = req.body;
      
      // Get current stats
      const userStats = await storageService.getData('user_game_stats');
      let stats = userStats && userStats.length > 0 ? userStats[0] : {
        xp: 0,
        level: 1,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        currentStreak: 0,
        longestStreak: 0,
        topics: {},
        badges: [],
        lastActivity: null
      };

      // Calculate XP
      let xpEarned = 0;
      const baseXP = 50;
      
      if (isCorrect) {
        xpEarned = baseXP;
        if (difficulty === 'hard') xpEarned += 30;
        else if (difficulty === 'medium') xpEarned += 15;
        if (!hintsUsed || hintsUsed === 0) xpEarned += 20;
        if (timeSpent < 30000) xpEarned += 15;
        stats.correctAnswers++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        stats.currentStreak = 0;
      }

      stats.totalQuestionsAnswered++;
      stats.xp += xpEarned;
      
      // Calculate level: level = sqrt(xp / 100) + 1
      const newLevel = Math.floor(Math.sqrt(stats.xp / 100)) + 1;
      stats.level = newLevel;
      stats.lastActivity = new Date().toISOString();

      // Update topic mastery
      if (!stats.topics) stats.topics = {};
      if (!stats.topics[topic]) {
        stats.topics[topic] = { mastery: 0.5, attempts: 0, correct: 0 };
      }
      
      const topicStats = stats.topics[topic];
      topicStats.attempts++;
      const learningRate = 0.1;
      const performance = isCorrect ? 1 : 0;
      topicStats.mastery = Math.min(1, Math.max(0, topicStats.mastery + learningRate * performance));
      if (isCorrect) topicStats.correct++;

      // Check for badges
      const badges = stats.badges || [];
      if (stats.correctAnswers >= 10 && !badges.includes('first_wins')) badges.push('first_wins');
      if (stats.longestStreak >= 5 && !badges.includes('streak_5')) badges.push('streak_5');
      if (topicStats.mastery >= 0.8 && !badges.includes(`master_${topic}`)) badges.push(`master_${topic}`);
      stats.badges = badges;

      await storageService.saveData('user_game_stats', stats);

      res.json({
        xpEarned,
        newLevel: stats.level,
        totalXP: stats.xp,
        currentStreak: stats.currentStreak,
        topicMastery: topicStats.mastery,
        badgesEarned: badges
      });
    } catch (error) {
      console.error('Game Stats Error:', error);
      res.status(500).json({ error: 'Failed to update game stats' });
    }
  });

  // Boss Battle - Trigger
  app.post('/api/game/boss-battle', async (req, res) => {
    try {
      const { topic } = req.body;
      
      const userStats = await storageService.getData('user_game_stats');
      const stats = userStats && userStats.length > 0 ? userStats[0] : { topics: {} };
      const topicMastery = stats.topics?.[topic]?.mastery || 0;
      
      if (topicMastery < 0.75) {
        return res.json({ 
          eligible: false, 
          message: `Complete more questions to unlock boss battle. Current mastery: ${(topicMastery * 100).toFixed(0)}%` 
        });
      }

      const prompt = `Generate a challenging BOSS BATTLE coding problem on ${topic}.
Respond ONLY with valid JSON:
{
  "questionId": "boss-${topic}-battle",
  "question": "The complex problem description",
  "starterCode": "// Starter code",
  "testCases": [{"input": "test", "expectedOutput": "result"}],
  "hints": ["hint1"],
  "timeLimit": 300,
  "xpReward": 200,
  "difficulty": "boss"
}`;

      const result = await AIService.geminiGenerate(prompt);
      
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const battleData = JSON.parse(jsonMatch[0]);
          res.json({ eligible: true, battle: battleData, topic });
        } else {
          throw new Error('No valid JSON');
        }
      } catch {
        res.json({
          eligible: true,
          battle: {
            questionId: `boss-${topic}-fallback`,
            question: `Advanced ${topic} Challenge: Implement a complex solution.`,
            starterCode: `// Implement your solution\nfunction solve(input) {\n  return input;\n}`,
            testCases: [{ input: 'test', expectedOutput: 'result' }],
            hints: ['Think about edge cases'],
            timeLimit: 300,
            xpReward: 200,
            difficulty: 'boss'
          },
          topic
        });
      }
    } catch (error) {
      console.error('Boss Battle Error:', error);
      res.status(500).json({ error: 'Failed to generate boss battle' });
    }
  });

  // Get leaderboard
  app.get('/api/game/leaderboard', async (req, res) => {
    const leaderboard = [
      { rank: 1, name: 'Alex Chen', xp: 2450, level: 16, badges: 8 },
      { rank: 2, name: 'Sarah Kim', xp: 2100, level: 15, badges: 6 },
      { rank: 3, name: 'Mike Johnson', xp: 1850, level: 14, badges: 5 },
      { rank: 4, name: 'Emily Davis', xp: 1600, level: 13, badges: 4 },
      { rank: 5, name: 'You', xp: 0, level: 1, badges: 0 },
    ];
    res.json(leaderboard);
  });

  return httpServer;
}

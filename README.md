# Entresst-AI

A comprehensive full-stack AI-powered career development platform that helps users track their skills, prepare for interviews, explore job opportunities, and accelerate their career growth.

![Entresst Logo](Entresst%20Logo.jpeg)

## 🚀 Features

### 1. Dashboard
- **User Profile Overview**: Display personalized information based on your target role
- **Skills Radar Chart**: Visual representation of your current skill levels
- **Statistics Cards**: Role match percentage, skill gaps, market growth, certifications due
- **AI Recommendations**: Personalized career advice powered by AI
- **Quick Actions**: Easy navigation to all features from one place

### 2. Profile Setup
- **Onboarding Flow**: Complete profile setup with name, email, role, and target role
- **Skills Assessment**: Add skills with proficiency levels (1-100 scale)
- **Career Goals**: Define your current role and target role for personalized recommendations
- **Profile Persistence**: Save profile data to storage (Supabase, MongoDB, or in-memory)

### 3. AI-Powered Quiz
- **Dynamic Question Generation**: AI generates questions based on user skill level
- **Adaptive Difficulty**: Quiz gets harder or easier based on performance
- **Category Selection**: Technical, Behavioral, System Design, etc.
- **Real-time Feedback**: Get explanations after each answer
- **Progress Tracking**: Track your quiz history and performance
- **Performance Analytics**: View accuracy, streaks, and topic mastery

### 4. Job Market Insights
- **Real-time Job Data**: Current job market statistics and trends
- **Demand Analysis**: In-demand skills with growth percentages
- **Salary Information**: Compensation data by role and experience level
- **Company Listings**: Top companies with openings, ratings, and culture info
- **Work Model Trends**: Remote, hybrid, and on-site job distributions
- **AI-Powered Recommendations**: Personalized job suggestions based on your profile

### 5. Mock Interview
- **AI-Generated Questions**: Practice with realistic interview questions
- **Technical & Behavioral**: Different question types for comprehensive prep
- **Answer Evaluation**: AI provides feedback on your responses
- **Difficulty Levels**: Easy, Medium, Hard questions
- **Performance Tracking**: Monitor your interview preparation progress

### 6. Algorithm Learning
- **Algorithm Explanations**: Detailed explanations of common algorithms
- **Complexity Analysis**: Time and space complexity for each algorithm
- **Code Examples**: Implementation in various programming languages
- **AI-Powered Tutoring**: Get AI explanations for any algorithm

### 7. Resume Analyzer
- **AI Resume Review**: Get AI-powered feedback on your resume
- **ATS Scoring**: Check if your resume passes ATS systems
- **Keyword Optimization**: Suggestions for improving resume visibility
- **Format Analysis**: Advice on resume structure and formatting

### 8. Advising Session
- **AI Career Advisor**: Chat with an AI career counselor
- **Personalized Guidance**: Get advice tailored to your profile
- **Career Path Planning**: Explore different career trajectories
- **Skill Gap Analysis**: Understand what skills you need to develop

### 9. AI Playground
- **Text Generation**: Generate text using different AI models (Gemini, OpenAI, HuggingFace)
- **Image Generation**: Create images from text prompts
- **Model Comparison**: Compare responses from multiple AI providers
- **Code Analysis**: Analyze code for improvements and best practices

### 10. Learning Resources
- **Curated Resources**: Links to tutorials, courses, and documentation
- **Category Organization**: Resources organized by topic
- **AI Recommendations**: Personalized resource suggestions
- **Progress Tracking**: Track your learning journey

### 11. Projects & Skills
- **Project Ideas**: AI-generated project suggestions based on your skills
- **Skill Tree**: Visual representation of skill progression
- **Milestone Tracking**: Track your progress through learning paths
- **Project Generator**: Generate personalized mini-projects

### 12. Game Center
- **XP & Levels**: Earn experience points for completing activities
- **Achievement Badges**: Unlock badges for accomplishments
- **Streak Tracking**: Maintain daily learning streaks
- **Leaderboard**: Compete with other learners
- **Boss Battles**: Challenge yourself with advanced problems

### 13. Storage Demo
- **Data Management**: Demo of storage capabilities
- **File Upload**: Upload and store files
- **Data Persistence**: Test data saving and retrieval

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Wouter** - Routing
- **TanStack Query** - Data fetching

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **Node.js** - Runtime

### AI/ML Services
- **Google Gemini** - Text and image generation
- **OpenAI** - GPT models
- **HuggingFace** - Open source models

### Storage (Multiple Options)
- **MongoDB** - Primary database (when configured)
- **Supabase** - PostgreSQL + Storage (when configured)
- **Firebase** - Firestore + Storage (when configured)
- **In-Memory** - Fallback storage

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/srakshitha0802/Entresst-AI-.git
cd Entresst-AI-
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables** (optional - works without for demo)
```bash
# Create .env file with any of these:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key
MONGODB_URI=your_mongodb_uri
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```bash
# Local access
http://localhost:5173

# Access from other devices on same network
http://YOUR_IP_ADDRESS:5173
```

## 🖥️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | Run TypeScript checks |

## 📁 Project Structure

```
Entresst-AI/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Layout components (Sidebar)
│   │   │   └── ui/           # UI component library
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── index.html           # HTML template
├── server/                   # Express backend
│   ├── services/
│   │   ├── ai.ts            # AI service integrations
│   │   ├── mongodb.ts      # MongoDB service
│   │   └── storage.ts       # Storage abstraction
│   ├── routes.ts            # API routes
│   └── index.ts             # Server entry point
├── script/                   # Build scripts
├── shared/                   # Shared types
├── package.json              # Dependencies
└── vite.config.ts            # Vite configuration
```

## 🔌 API Endpoints

### AI Endpoints
- `POST /api/ai/generate` - Generate text with specific AI provider
- `POST /api/ai/compare` - Compare AI provider responses
- `POST /api/ai/generate-image` - Generate images
- `POST /api/ai/quiz-question` - Generate quiz questions
- `POST /api/ai/job-insights` - Get job market insights
- `POST /api/ai/code-analysis` - Analyze code
- `POST /api/ai/algorithm-explain` - Explain algorithms
- `POST /api/ai/interview-prep` - Generate interview prep
- `POST /api/ai/system-design` - System design assistance

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Update profile
- `POST /api/user/profile-setup` - Complete onboarding

### Game Endpoints
- `GET /api/game/stats` - Get user game stats
- `POST /api/game/submit-answer` - Submit quiz answer
- `POST /api/game/boss-battle` - Start boss battle
- `GET /api/game/leaderboard` - Get leaderboard

### Storage Endpoints
- `GET /api/storage/:collection` - Get data
- `POST /api/storage/:collection` - Save data

### Auth Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/demo` - Demo login

## 🎮 Game Mechanics

### Earning XP
- Answer correctly: 50 XP base
- Hard difficulty: +30 XP
- Medium difficulty: +15 XP
- No hints used: +20 XP
- Fast answer (<30s): +15 XP

### Leveling Up
- Level formula: `Level = floor(sqrt(XP / 100)) + 1`

### Badges
- `first_wins` - Answer 10 questions correctly
- `streak_5` - Get 5 correct in a row
- `master_[topic]` - Achieve 80% mastery in a topic

## 🔧 Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5173) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `HUGGINGFACE_API_KEY` | HuggingFace API key |
| `MONGODB_URI` | MongoDB connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email |
| `FIREBASE_PRIVATE_KEY` | Firebase private key |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 👥 Collaborators

### Core Contributors
- **srakshitha0802** - Lead Developer
- **lakshmijahnavik** - Contributor

---

Built with ❤️ for career development and learning.


# Q2 2025 Software Earnings Analysis

An AI-powered earnings analysis platform for Q2 2025 software company earnings calls. Built with Next.js, TypeScript, and integrated with Pinecone for semantic search and OpenAI for intelligent analysis.

## Features

### 🔍 **Intelligent Earnings Analysis**
- Ask natural language questions about software company earnings
- AI-powered responses using GPT-4 with earnings call context
- Support for brief, detailed, and comprehensive response levels
- Plain text responses optimized for readability

### 📊 **Company Source Selection**
- Organized by software categories (SaaS, Security, DevTools, etc.)
- 100+ software companies from Q2 2025 earnings calls
- Multi-select interface for targeted analysis

### 📚 **Research Library**
- Save important insights and analysis snippets
- Expandable content for long analyses
- Search functionality across saved snippets
- Export capabilities for research compilation

### 🎯 **Smart Context Retrieval**
- Pinecone vector database for semantic search
- Retrieval-Augmented Generation (RAG) for accurate responses
- Source attribution for all analysis

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI/ML**: OpenAI GPT-4, Pinecone Vector Database
- **Storage**: LocalStorage for Research Library
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18.18.0+ or 19.8.0+ or 20.0.0+
- OpenAI API key
- Pinecone API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bme3412/q2-software.git
cd q2-software
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select Companies**: Choose software companies from the left panel by category
2. **Ask Questions**: Type natural language questions about earnings, metrics, or trends
3. **Get Analysis**: Receive AI-powered analysis based on actual earnings call data
4. **Save Insights**: Click "Save" on important responses to add them to your Research Library
5. **Manage Research**: Use the Research Library panel to search, expand, and export your saved insights

## Example Questions

- "How did SaaS companies perform in Q2 2025?"
- "What are the key AI initiatives mentioned by software companies?"
- "Compare the growth rates of cybersecurity companies"
- "What guidance did cloud infrastructure companies provide?"

## API Endpoints

- `/api/pinecone-rag` - Main RAG endpoint for earnings analysis
- `/api/chat` - Alternative chat endpoint
- `/api/suggest-questions` - Dynamic question suggestions
- `/api/health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for Q2 2025 software earnings analysis
- Powered by OpenAI and Pinecone
- Earnings data from public company filings
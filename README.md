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

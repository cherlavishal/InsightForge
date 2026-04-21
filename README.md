# InsightForge: Cloud-Native AI System for Intelligent Data-Driven Decision Support

## Overview
InsightForge is a smart, cloud-native analytics platform that transforms raw data into actionable intelligence using machine learning and AI. The system learns patterns, predicts outcomes, and presents insights through interactive visualizations.

## Features
- 📊 **Advanced Data Analytics**: Process and analyze structured/unstructured data
- 🤖 **AI-Powered Insights**: Gemini AI integration for intelligent recommendations
- 📈 **Interactive Visualizations**: Dynamic charts and dashboards
- ☁️ **Cloud-Native**: Deployable on Render & Vercel
- 🔒 **Secure Authentication**: JWT-based user authentication
- 🚀 **Real-time Processing**: Fast data processing with async operations

## Tech Stack
- **Backend**: Python (FastAPI), PostgreSQL, SQLAlchemy, Gemini AI
- **Frontend**: Next.js 14, React, Tailwind CSS, Chart.js
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Deployment**: Render (Backend), Vercel (Frontend), Docker
- **AI/ML**: Google Gemini API, scikit-learn, pandas

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Development Setup
1. Clone the repository
2. Set up backend:
   ```bash
   cd backend
   cp .env.example .env
   pip install -r requirements.txt
   
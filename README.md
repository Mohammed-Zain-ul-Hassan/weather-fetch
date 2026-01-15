# Weather AI Chatbot ☁️

A sleek, real-time weather assistant powered by **Gemini 2.5 Flash Lite** and the **Vercel AI SDK**.

## Features
- **AI Reasoning**: Ask questions about the weather in natural language.
- **Real-time Data**: Fetches live weather from the OpenWeather API.
- **Modern UI**: Dark-themed, responsive interface built with Tailwind CSS v4 and Geist Typography.
- **Edge Streaming**: Fast, low-latency streaming responses via Next.js Edge Runtime.

## Tech Stack
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **AI Tooling**: [Vercel AI SDK v6](https://sdk.vercel.ai/)
- **LLM**: [Google Gemini 2.5 Flash Lite](https://ai.google.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Weather Data**: [OpenWeather API](https://openweathermap.org/api)

## Getting Started

### 1. Prerequisites
You will need:
- A Google AI (Gemini) API Key.
- An OpenWeather API Key.

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
OPENWEATHER_API_KEY=your_openweather_key
```

### 3. Installation
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture
- `app/api/chat/route.ts`: Backend logic for tool calling and AI streaming.
- `app/page.tsx`: Main chat interface and tool result rendering.
- `app/globals.css`: Tailwind v4 theme configurations.

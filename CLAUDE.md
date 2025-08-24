# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Word Crack Game is an interactive web-based English learning game where users fill in blanks in famous movie quotes, song lyrics, book excerpts, and sayings. The project uses a hybrid architecture with vanilla JavaScript frontend and Cloudflare Workers backend.

## Development Commands

### Frontend Development
- **Local Development**: Open `index.html` directly in browser or use Live Server for TTS functionality
- **No build process**: Pure vanilla JavaScript with ES modules

### Backend API (wordcrack-api/)
- **Development**: `cd wordcrack-api && npm run dev` - Start Wrangler development server
- **Deploy to Development**: `cd wordcrack-api && npm run deploy:dev`
- **Deploy to Production**: `cd wordcrack-api && npm run deploy:prod`

### Environment Setup
- Backend requires Cloudflare Workers environment
- Frontend works with any static file server
- API endpoints require Supabase database connection (configured via Cloudflare secrets)

## Architecture Overview

### Frontend Structure (Vanilla JavaScript + ES Modules)
- **script.js** - Main game controller, UI management, event handling
- **content-generator.js** - Quiz generation from content database
- **content-database.js** - All sentence/quote data storage
- **data-manager.js** - localStorage-based user data persistence
- **achievement-system.js** - Badge and achievement logic
- **auth-manager.js** - Google OAuth integration
- **game-state-manager.js** - Phase 4-A game state management
- **config.js** - Feature flags and configuration

### Backend Structure (Cloudflare Workers)
- **src/index.js** - Main Worker router with API endpoints
- **handlers/** - Request handlers for auth, scores, leaderboard
- **utils/** - CORS headers, Supabase client utilities

### Key Design Patterns
- **Module Pattern**: Each JS file exports a class or object with specific responsibilities
- **Event-Driven Architecture**: DOM events drive game state transitions
- **Feature Flags**: `config.js` controls feature availability with `isFeatureEnabled()`
- **Data Persistence**: localStorage for user data, Supabase for global features

### API Integration Points
- **Google TTS**: `functions/google-tts.js` (Cloudflare serverless function)
- **Authentication**: Google OAuth via Cloudflare Workers
- **Leaderboard**: Real-time global scores via Supabase
- **CORS**: All API responses include proper CORS headers

### Important File Relationships
- `script.js` imports and orchestrates all other modules
- `content-generator.js` depends on `content-database.js` for question data
- `auth-manager.js` communicates with backend API for authentication
- `data-manager.js` handles all localStorage operations independently

### Development Phases
The codebase is structured in development phases (comments like "Phase 2:", "Phase 3:", etc.) indicating feature evolution:
- **Phase 1**: Core game mechanics
- **Phase 2**: Local data management and achievements  
- **Phase 3**: Global competition and authentication
- **Phase 4-A**: UI consistency and UX improvements
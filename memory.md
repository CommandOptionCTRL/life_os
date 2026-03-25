# LifeOS Memory

This file serves as a persistent memory for the LifeOS project, tracking key decisions, architectural patterns, and user preferences.

## Core Principles
- **Mobile First**: Design for touch and small screens first.
- **Offline First**: Use Firestore with local persistence.
- **Svelte 5 Runes**: Use `$state`, `$derived`, etc. for reactivity.

## Key Decisions
- **Netlify Deployment**: Using `@sveltejs/adapter-netlify` and CLI for deployment.
- **Defensive Stores**: Merging snapshots with `DEFAULT_SETTINGS` to prevent state oscillation.
- **Firebase Collection Structure**: `lifeAreas`, `projects`, `tasks`, `actions`, `brainDump`, `followups`, `settings`.

## Project History
- **2026-03-24**: Fixed 500 error on Focus page (ReferenceError in `getActionPath`).
- **2026-03-24**: Set up Netlify deployment configuration and guide.
- **2026-03-24**: Fixed Theme Toggle self-toggling issue (Defensive merging in `settings.js`).

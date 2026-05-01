# Recipes PWA

A full-stack Progressive Web App to search, save, and manage recipes.

## Live Demo
https://recipes-pwa-bay.vercel.app

## Features
- Search recipes
- Browse by category
- View detailed recipes
- Save favorites (IndexedDB)
- Shopping list grouped by recipe
- Copy shopping list to clipboard
- Offline support (PWA)

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node + Express
- Deployment: Vercel (frontend), Render (backend)
- Storage: IndexedDB

## How to Run Locally

### Client
cd client
npm install
npm run dev

### Server
cd server
npm install
npm start

Create `.env` in `server`:
MEALDB_API_BASE=https://www.themealdb.com/api/json/v1
MEALDB_API_KEY=1

## Notes
- Backend is deployed on Render
- Free tier may sleep after inactivity
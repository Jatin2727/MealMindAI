# MealMind AI 🥑

A mobile meal-planning app for Indian home cooking. Browse veg and non-veg recipes, plan today's meal, track estimated nutrition, build a grocery list, and generate new recipes from the ingredients you already have using an AI Chef powered by Google Gemini.

**Stack:** React Native (Expo) · Flask · SQLite · Google Gemini · Token-based auth

---

## Features

- **Accounts:** sign up, log in, log out, and automatic session restore. Passwords are hashed and sessions use signed, expiring tokens.
- **Recipe library:** 20 Indian recipes with search, category filters (Breakfast, Lunch, Dinner, Snacks), Veg / Non-Veg filter and a high-protein filter.
- **AI Chef:** enter the ingredients you have, pick a food preference, and Gemini generates a beginner-friendly recipe with cooking tips and food-safety guidance. The backend enforces the veg / non-veg preference in the prompt.
- **Meal planner:** choose a recipe for today.
- **Nutrition tracker:** estimated calories and macros for the planned meal against example daily goals.
- **Grocery list:** add items manually or from a recipe, tick them off, delete them.
- **Saved recipes:** save favourites, including AI-generated ones.
- **Per-user data:** saved recipes, plans and groceries are stored on-device separately for each account.

## Architecture

```
React Native app (Expo)  ──HTTPS + Bearer token──▶  Flask API  ──▶  SQLite (users)
                                                        │
                                                        └──▶  Google Gemini API
```

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/health` | GET | No | Health check |
| `/register` | POST | No | Create account, returns token |
| `/login` | POST | No | Log in, returns token |
| `/me` | GET | Yes | Validate session, return user |
| `/generate-recipe` | POST | Yes | Generate a recipe with Gemini |

## Run it locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create `backend/.env` (see `.env.example`):

```
GEMINI_API_KEY=your_gemini_key
AUTH_SECRET_KEY=a_long_random_string
```

```bash
python app.py
```

### App

```bash
npm install
```

Set `API_URL` at the top of `App.js` to your backend (your PC's LAN IP for local testing, e.g. `http://192.168.x.x:5000`, or the deployed HTTPS URL), then:

```bash
npx expo start
```

Open it in Expo Go on a phone connected to the same Wi-Fi.

## Deployment

- **Backend:** deployed on Render (root directory `backend`, start command `gunicorn app:app`, secrets set as environment variables).
- **Android build:** `eas build -p android --profile preview` produces an installable APK.

## Known limitations

- The free hosting tier sleeps when idle, so the first request after a pause can take up to ~50 seconds.
- SQLite on free hosting is not persistent across redeploys, so accounts may reset when the backend is redeployed. A hosted database such as PostgreSQL would fix this.
- No password reset or email verification yet.
- Nutrition values are approximate estimates, not medical or dietary advice.
- Recipe and nutrition data are bundled in the app; only AI recipes come from the server.

## Roadmap

- Weekly meal planning with breakfast / lunch / dinner slots
- Persistent PostgreSQL database
- Password reset by email
- Calorie tracking across multiple meals
- Ingredient-based recipe search

## Author

Built by **Jatin** — B.E. Computer Science (AIML). 

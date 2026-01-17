# LifeOS: AI-Powered Decision Intelligence for Personal Health & Lifestyle

An intelligent life management platform that combines health, habits, mood, nutrition, and finance data into a unified AI-driven dashboard. Aligned with **SDG-3 (Good Health & Well-Being)**.

## Features

- **User Authentication** - Secure JWT-based registration and login
- **Habit Tracking** - Track daily habits with streaks and completion rates
- **Mood & Journal** - Log mood, energy, stress levels and journal entries
- **Nutrition Tracking** - Monitor calorie, protein, carbs, fat intake
- **Finance Management** - Track income, expenses, budgets and goals
- **AI-Powered Life Score** - Unified score based on all life areas
- **Smart Insights** - AI-generated recommendations and patterns

## Life Score Formula

```
Life Score = 0.30 × Habit Score + 0.25 × Nutrition Score + 0.20 × Mood Score + 0.15 × Finance Score + 0.10 × Consistency Score
```

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Recharts
- React Router
- Axios

### Backend
- Python FastAPI
- SQLAlchemy ORM
- JWT Authentication
- Rule-based AI/ML

### Database
- PostgreSQL

## Project Structure

```
LifeOS/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # Auth context
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── core/          # Config, security, database
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── ai/            # AI/ML modules
│   └── requirements.txt
│
├── database/          # SQL files
│   ├── schema.sql
│   └── seed.sql
│
└── docs/              # Documentation
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL database

### Backend Setup

```bash
cd LifeOS/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit .env file with your database credentials

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd LifeOS/frontend

# Install dependencies
npm install

# Configure API URL (optional)
# Create .env file with VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

### Database Setup

```bash
# Connect to PostgreSQL and run schema
psql -U postgres -d lifeos -f database/schema.sql

# Optional: Run seed data
psql -U postgres -d lifeos -f database/seed.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Habits
- `GET /api/habits/` - Get all habits
- `POST /api/habits/` - Create habit
- `POST /api/habits/log` - Log habit completion

### Mood
- `GET /api/mood/` - Get mood entries
- `POST /api/mood/` - Log mood
- `POST /api/mood/journal` - Create journal entry

### Nutrition
- `GET /api/nutrition/food` - Get food logs
- `POST /api/nutrition/food` - Log food
- `POST /api/nutrition/water` - Log water intake

### Finance
- `GET /api/finance/transactions` - Get transactions
- `POST /api/finance/transactions` - Create transaction
- `GET /api/finance/summary/monthly` - Monthly summary

### Insights
- `GET /api/insights/life-score` - Get life score
- `GET /api/insights/recommendations` - Get AI recommendations
- `GET /api/insights/dashboard` - Get dashboard data

## Demo Credentials

- Email: `demo@lifeos.com`
- Password: `demo123`

## SDG-3 Alignment

This project supports **UN Sustainable Development Goal 3: Good Health and Well-Being** by:

1. Promoting healthy lifestyle habits
2. Encouraging balanced nutrition
3. Supporting mental health through mood tracking
4. Reducing stress through financial awareness
5. Providing AI-powered health insights

## License

MIT License - Built for hackathon demonstration purposes.

# LifeOS API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "John Doe",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## Habits Endpoints

### Get All Habits
```http
GET /habits/
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Morning Meditation",
    "description": "10 minutes of mindfulness",
    "frequency": "daily",
    "target_count": 1,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "current_streak": 7,
    "completion_rate": 85.5
  }
]
```

### Create Habit
```http
POST /habits/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Morning Meditation",
  "description": "10 minutes of mindfulness",
  "frequency": "daily",
  "target_count": 1
}
```

### Log Habit Completion
```http
POST /habits/log
Authorization: Bearer <token>
Content-Type: application/json

{
  "habit_id": 1,
  "completed_at": "2024-01-15",
  "count": 1,
  "notes": "Felt great today"
}
```

---

## Mood Endpoints

### Get Mood Entries
```http
GET /mood/?days=30
Authorization: Bearer <token>
```

### Log Mood
```http
POST /mood/
Authorization: Bearer <token>
Content-Type: application/json

{
  "mood_score": 8,
  "energy_level": 7,
  "stress_level": 3,
  "sleep_hours": 7,
  "notes": "Good day overall",
  "logged_at": "2024-01-15"
}
```

### Create Journal Entry
```http
POST /mood/journal
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Reflections",
  "content": "Today was productive...",
  "tags": "gratitude,work",
  "logged_at": "2024-01-15"
}
```

---

## Nutrition Endpoints

### Get Food Logs
```http
GET /nutrition/food?days=7
Authorization: Bearer <token>
```

### Log Food
```http
POST /nutrition/food
Authorization: Bearer <token>
Content-Type: application/json

{
  "food_name": "Grilled Chicken Salad",
  "meal_type": "lunch",
  "calories": 450,
  "protein": 35,
  "carbs": 20,
  "fat": 15,
  "fiber": 5,
  "serving_size": "1 large bowl",
  "logged_at": "2024-01-15"
}
```

### Log Water
```http
POST /nutrition/water
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount_ml": 250,
  "logged_at": "2024-01-15"
}
```

### Get Daily Summary
```http
GET /nutrition/summary/2024-01-15
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_calories": 1850,
  "total_protein": 95,
  "total_carbs": 200,
  "total_fat": 55,
  "total_water": 2000,
  "goal_calories": 2000,
  "goal_protein": 50,
  "goal_carbs": 250,
  "goal_fat": 65,
  "goal_water": 2000
}
```

---

## Finance Endpoints

### Get Transactions
```http
GET /finance/transactions?days=30
Authorization: Bearer <token>
```

### Create Transaction
```http
POST /finance/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "category": "Food",
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "transaction_date": "2024-01-15"
}
```

### Get Monthly Summary
```http
GET /finance/summary/monthly?month=1&year=2024
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_income": 5000,
  "total_expenses": 3500,
  "net_savings": 1500,
  "expense_by_category": {
    "Food": 800,
    "Transportation": 300,
    "Entertainment": 200
  }
}
```

---

## Insights Endpoints

### Get Life Score
```http
GET /insights/life-score
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "habit_score": 75.5,
  "nutrition_score": 68.2,
  "mood_score": 80.0,
  "finance_score": 65.0,
  "consistency_score": 70.0,
  "total_score": 72.5,
  "calculated_at": "2024-01-15",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Get Score Breakdown
```http
GET /insights/life-score/breakdown
Authorization: Bearer <token>
```

### Get AI Recommendations
```http
GET /insights/recommendations
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "category": "habits",
    "insight_type": "recommendation",
    "title": "Boost Your Habit Score",
    "content": "Your habit score is below average...",
    "priority": 4,
    "is_read": 0,
    "generated_at": "2024-01-15T10:00:00Z"
  }
]
```

### Get Dashboard Data
```http
GET /insights/dashboard
Authorization: Bearer <token>
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Email or username already registered"
}
```

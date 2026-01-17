from typing import List, Dict, Optional

MOOD_KEYWORDS = {
    "positive": ["happy", "grateful", "excited", "peaceful", "energized", "productive", "content"],
    "negative": ["sad", "anxious", "stressed", "tired", "frustrated", "overwhelmed", "angry"],
    "neutral": ["okay", "fine", "normal", "average", "stable"]
}

def analyze_journal_sentiment(content: str) -> Dict:
    content_lower = content.lower()
    
    positive_count = sum(1 for word in MOOD_KEYWORDS["positive"] if word in content_lower)
    negative_count = sum(1 for word in MOOD_KEYWORDS["negative"] if word in content_lower)
    
    if positive_count > negative_count:
        sentiment = "positive"
        score = min(0.5 + (positive_count * 0.1), 1.0)
    elif negative_count > positive_count:
        sentiment = "negative"
        score = max(0.5 - (negative_count * 0.1), 0.0)
    else:
        sentiment = "neutral"
        score = 0.5
    
    return {
        "sentiment": sentiment,
        "score": round(score, 2),
        "positive_indicators": positive_count,
        "negative_indicators": negative_count
    }

def detect_mood_patterns(mood_entries: List[Dict]) -> Dict:
    if len(mood_entries) < 5:
        return {"pattern": "insufficient_data", "insights": []}
    
    avg_mood = sum(e["mood_score"] for e in mood_entries) / len(mood_entries)
    avg_energy = sum(e["energy_level"] for e in mood_entries) / len(mood_entries)
    avg_stress = sum(e["stress_level"] for e in mood_entries) / len(mood_entries)
    
    insights = []
    
    if avg_mood < 5 and avg_stress > 6:
        insights.append("High stress appears to correlate with lower mood. Consider stress-reduction activities.")
    
    if avg_energy < 5 and avg_mood < 5:
        insights.append("Low energy and mood often go together. Try improving sleep or adding light exercise.")
    
    recent = mood_entries[-3:]
    earlier = mood_entries[:-3]
    
    recent_avg = sum(e["mood_score"] for e in recent) / len(recent)
    earlier_avg = sum(e["mood_score"] for e in earlier) / len(earlier)
    
    if recent_avg > earlier_avg + 1:
        pattern = "improving"
        insights.append("Your mood has been improving recently. Keep up the positive momentum!")
    elif recent_avg < earlier_avg - 1:
        pattern = "declining"
        insights.append("Your mood has been declining. Consider what factors might be contributing.")
    else:
        pattern = "stable"
    
    return {
        "pattern": pattern,
        "avg_mood": round(avg_mood, 1),
        "avg_energy": round(avg_energy, 1),
        "avg_stress": round(avg_stress, 1),
        "insights": insights
    }

def suggest_mood_activities(mood_score: int, energy_level: int, stress_level: int) -> List[str]:
    suggestions = []
    
    if mood_score < 4:
        suggestions.extend([
            "Try a 10-minute walk outside",
            "Connect with a friend or family member",
            "Practice gratitude by listing 3 good things"
        ])
    
    if energy_level < 4:
        suggestions.extend([
            "Take a short power nap (15-20 minutes)",
            "Have a healthy snack with protein",
            "Do some light stretching"
        ])
    
    if stress_level > 7:
        suggestions.extend([
            "Try deep breathing exercises (4-7-8 technique)",
            "Take a break from screens",
            "Write down your worries to process them"
        ])
    
    return suggestions[:5]

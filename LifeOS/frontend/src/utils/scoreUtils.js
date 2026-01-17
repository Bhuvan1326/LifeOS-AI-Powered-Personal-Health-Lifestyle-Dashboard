export const calculateLifeScore = (scores) => {
  const weights = {
    habit: 0.30,
    nutrition: 0.25,
    mood: 0.20,
    finance: 0.15,
    consistency: 0.10
  }

  return (
    (scores.habit || 0) * weights.habit +
    (scores.nutrition || 0) * weights.nutrition +
    (scores.mood || 0) * weights.mood +
    (scores.finance || 0) * weights.finance +
    (scores.consistency || 0) * weights.consistency
  )
}

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  if (score >= 20) return 'Needs Improvement'
  return 'Critical'
}

export const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export const getScoreBgColor = (score) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

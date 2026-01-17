import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import ChartCard from '../../components/ChartCard'
import api from '../../services/api'
import { TrendingUp, Info } from 'lucide-react'

export default function LifeScore() {
  const [scoreData, setScoreData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoreRes, historyRes] = await Promise.all([
          api.get('/api/insights/life-score/breakdown'),
          api.get('/api/insights/life-score/history?days=30')
        ])
        setScoreData(scoreRes.data)
        setHistory(historyRes.data.map(h => ({
          date: new Date(h.calculated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: h.total_score
        })).reverse())
      } catch (error) {
        console.error('Failed to fetch life score:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Average'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Life Score</h1>
        <p className="text-gray-600 mt-1">Your comprehensive health and lifestyle score</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${(scoreData?.total_score || 0) * 4.4} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(scoreData?.total_score || 0)}`}>
                  {scoreData?.total_score?.toFixed(0) || 0}
                </span>
                <span className="text-sm text-gray-500">out of 100</span>
              </div>
            </div>
            <p className={`mt-4 text-lg font-semibold ${getScoreColor(scoreData?.total_score || 0)}`}>
              {getScoreLabel(scoreData?.total_score || 0)}
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Score History" icon={TrendingUp}>
          {history.length > 0 ? (
            <ChartCard data={history} dataKey="score" height={200} />
          ) : (
            <p className="text-gray-500 text-center py-8">Not enough data for history chart</p>
          )}
        </Card>
      </div>

      <Card title="Score Formula" icon={Info}>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-6">
          Life Score = (0.30 × Habit) + (0.25 × Nutrition) + (0.20 × Mood) + (0.15 × Finance) + (0.10 × Consistency)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Habits', score: scoreData?.habit_score || 0, weight: 0.30, color: 'bg-blue-500' },
            { label: 'Nutrition', score: scoreData?.nutrition_score || 0, weight: 0.25, color: 'bg-orange-500' },
            { label: 'Mood', score: scoreData?.mood_score || 0, weight: 0.20, color: 'bg-pink-500' },
            { label: 'Finance', score: scoreData?.finance_score || 0, weight: 0.15, color: 'bg-green-500' },
            { label: 'Consistency', score: scoreData?.consistency_score || 0, weight: 0.10, color: 'bg-purple-500' },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-xs text-gray-400">{(item.weight * 100).toFixed(0)}%</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.score.toFixed(0)}</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Contributes: {(item.score * item.weight).toFixed(1)} pts
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

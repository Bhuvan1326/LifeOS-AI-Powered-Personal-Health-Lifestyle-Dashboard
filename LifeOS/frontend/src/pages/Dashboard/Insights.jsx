import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import api from '../../services/api'
import { Lightbulb, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

export default function Insights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/api/insights/recommendations')
        setInsights(response.data)
      } catch (error) {
        console.error('Failed to fetch insights:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  const markAsRead = async (insightId) => {
    try {
      await api.post(`/api/insights/recommendations/${insightId}/read`)
      setInsights(insights.filter(i => i.id !== insightId))
    } catch (error) {
      console.error('Failed to mark insight as read:', error)
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'alert': return AlertTriangle
      case 'recommendation': return Lightbulb
      case 'pattern': return TrendingUp
      default: return Lightbulb
    }
  }

  const getInsightColor = (priority) => {
    if (priority >= 4) return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' }
    if (priority >= 2) return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-500' }
    return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500' }
  }

  const getCategoryBadge = (category) => {
    const badges = {
      habits: 'bg-blue-100 text-blue-700',
      nutrition: 'bg-orange-100 text-orange-700',
      mood: 'bg-pink-100 text-pink-700',
      finance: 'bg-green-100 text-green-700',
      general: 'bg-gray-100 text-gray-700'
    }
    return badges[category] || badges.general
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-600 mt-1">Personalized recommendations based on your data</p>
      </div>

      {insights.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
            <p className="text-gray-600 mt-2">No new insights at the moment. Keep logging your data!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.insight_type)
            const colors = getInsightColor(insight.priority)
            
            return (
              <Card 
                key={insight.id}
                className={`${colors.bg} ${colors.border} border`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadge(insight.category)}`}>
                        {insight.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        Priority: {insight.priority}/5
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-gray-600 mt-1">{insight.content}</p>
                    <button
                      onClick={() => markAsRead(insight.id)}
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mark as read
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/Card'
import api from '../../services/api'
import { 
  TrendingUp, 
  CheckSquare, 
  Apple, 
  Heart, 
  DollarSign,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/insights/dashboard')
        setDashboardData(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const lifeScore = dashboardData?.life_score?.total_score || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your health dashboard overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Life Score</p>
              <p className="text-3xl font-bold mt-1">{lifeScore.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary-200" />
          </div>
          <Link to="/life-score" className="flex items-center gap-1 mt-4 text-sm text-primary-100 hover:text-white">
            View details <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Habits Today</p>
              <p className="text-2xl font-bold mt-1">
                {dashboardData?.habit_summary?.completed_today || 0}/{dashboardData?.habit_summary?.total_habits || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Calories Today</p>
              <p className="text-2xl font-bold mt-1">
                {dashboardData?.nutrition_summary?.calories_consumed?.toFixed(0) || 0}
                <span className="text-sm font-normal text-gray-500">
                  /{dashboardData?.nutrition_summary?.calories_goal || 2000}
                </span>
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Apple className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Mood</p>
              <p className="text-2xl font-bold mt-1">
                {dashboardData?.mood_summary?.today_mood || '--'}/10
              </p>
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Score Breakdown" icon={TrendingUp}>
            <div className="space-y-4">
              {[
                { label: 'Habits', score: dashboardData?.life_score?.habit_score || 0, color: 'bg-blue-500', weight: '30%' },
                { label: 'Nutrition', score: dashboardData?.life_score?.nutrition_score || 0, color: 'bg-orange-500', weight: '25%' },
                { label: 'Mood', score: dashboardData?.life_score?.mood_score || 0, color: 'bg-pink-500', weight: '20%' },
                { label: 'Finance', score: dashboardData?.life_score?.finance_score || 0, color: 'bg-green-500', weight: '15%' },
                { label: 'Consistency', score: dashboardData?.life_score?.consistency_score || 0, color: 'bg-purple-500', weight: '10%' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.label} ({item.weight})</span>
                    <span className="font-medium">{item.score.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="AI Insights" icon={Lightbulb}>
          <div className="space-y-3">
            {dashboardData?.insights?.length > 0 ? (
              dashboardData.insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    insight.priority >= 4 ? 'bg-red-50 border-red-200' :
                    insight.priority >= 2 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{insight.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{insight.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No new insights. Keep logging your data!</p>
            )}
          </div>
          <Link 
            to="/insights" 
            className="flex items-center gap-1 mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            View all insights <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      <Card title="Monthly Finance" icon={DollarSign}>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Income</p>
            <p className="text-xl font-bold text-green-600">
              ${dashboardData?.finance_summary?.monthly_income?.toFixed(0) || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Expenses</p>
            <p className="text-xl font-bold text-red-600">
              ${dashboardData?.finance_summary?.monthly_expenses?.toFixed(0) || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Net Savings</p>
            <p className={`text-xl font-bold ${
              (dashboardData?.finance_summary?.net_savings || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              ${dashboardData?.finance_summary?.net_savings?.toFixed(0) || 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

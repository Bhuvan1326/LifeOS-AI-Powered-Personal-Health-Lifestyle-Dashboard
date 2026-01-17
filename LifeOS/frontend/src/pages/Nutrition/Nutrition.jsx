import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { nutritionService } from '../../services/nutritionService'
import FoodLog from './FoodLog'
import { Apple, Plus, Droplets, Target } from 'lucide-react'

export default function Nutrition() {
  const [foodLogs, setFoodLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [goals, setGoals] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [foodData, summaryData, goalsData] = await Promise.all([
        nutritionService.getTodayFood(),
        nutritionService.getDailySummary(today),
        nutritionService.getGoals()
      ])
      setFoodLogs(foodData)
      setSummary(summaryData)
      setGoals(goalsData)
    } catch (error) {
      console.error('Failed to fetch nutrition data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await nutritionService.logWater({ amount_ml: 250, logged_at: today })
      fetchData()
    } catch (error) {
      console.error('Failed to log water:', error)
    }
  }

  const handleDeleteFood = async (foodId) => {
    try {
      await nutritionService.deleteFoodLog(foodId)
      fetchData()
    } catch (error) {
      console.error('Failed to delete food:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const caloriePercent = summary ? (summary.total_calories / summary.goal_calories) * 100 : 0
  const proteinPercent = summary ? (summary.total_protein / summary.goal_protein) * 100 : 0
  const waterPercent = summary ? (summary.total_water / summary.goal_water) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nutrition Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your daily intake</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Food
        </button>
      </div>

      {showForm && (
        <FoodLog
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchData()
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Calories</span>
            <Apple className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold">
            {summary?.total_calories?.toFixed(0) || 0}
            <span className="text-sm font-normal text-gray-500">/{summary?.goal_calories || 2000}</span>
          </p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${caloriePercent > 100 ? 'bg-red-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min(caloriePercent, 100)}%` }}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Protein</span>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">
            {summary?.total_protein?.toFixed(0) || 0}g
            <span className="text-sm font-normal text-gray-500">/{summary?.goal_protein || 50}g</span>
          </p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min(proteinPercent, 100)}%` }}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Water</span>
            <Droplets className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold">
            {((summary?.total_water || 0) / 1000).toFixed(1)}L
            <span className="text-sm font-normal text-gray-500">/{(summary?.goal_water || 2000) / 1000}L</span>
          </p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${Math.min(waterPercent, 100)}%` }}
            />
          </div>
          <button
            onClick={handleLogWater}
            className="mt-3 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
          >
            + Add 250ml
          </button>
        </Card>
      </div>

      <Card title="Today's Food Log" icon={Apple}>
        {foodLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No food logged today</p>
        ) : (
          <div className="divide-y">
            {foodLogs.map((food) => (
              <div key={food.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{food.food_name}</p>
                  <p className="text-sm text-gray-500">
                    {food.meal_type} • {food.serving_size || '1 serving'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{food.calories} cal</p>
                  <p className="text-xs text-gray-500">
                    P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

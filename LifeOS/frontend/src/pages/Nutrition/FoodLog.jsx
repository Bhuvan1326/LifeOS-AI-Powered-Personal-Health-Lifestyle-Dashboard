import { useState } from 'react'
import { nutritionService } from '../../services/nutritionService'
import { X } from 'lucide-react'

export default function FoodLog({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    food_name: '',
    meal_type: 'breakfast',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    serving_size: '',
    logged_at: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await nutritionService.createFoodLog(formData)
      onSuccess()
    } catch (error) {
      console.error('Failed to log food:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Log Food</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Food Name</label>
            <input
              type="text"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              className="input"
              placeholder="e.g., Grilled Chicken Salad"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Meal Type</label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                className="input"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="label">Serving Size</label>
              <input
                type="text"
                value={formData.serving_size}
                onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                className="input"
                placeholder="e.g., 1 cup"
              />
            </div>
          </div>

          <div>
            <label className="label">Calories</label>
            <input
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) })}
              className="input"
              min={0}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Protein (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                className="input"
                min={0}
              />
            </div>
            <div>
              <label className="label">Carbs (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                className="input"
                min={0}
              />
            </div>
            <div>
              <label className="label">Fat (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                className="input"
                min={0}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

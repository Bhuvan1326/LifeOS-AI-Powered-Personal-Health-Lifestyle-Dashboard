import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { habitService } from '../../services/habitService'
import HabitForm from './HabitForm'
import { CheckSquare, Plus, Flame, Check, Trash2 } from 'lucide-react'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [todayLogs, setTodayLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [habitsData, logsData] = await Promise.all([
        habitService.getHabits(),
        habitService.getTodayLogs()
      ])
      setHabits(habitsData)
      setTodayLogs(logsData)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogHabit = async (habitId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await habitService.logHabit({
        habit_id: habitId,
        completed_at: today,
        count: 1
      })
      fetchData()
    } catch (error) {
      console.error('Failed to log habit:', error)
    }
  }

  const handleDeleteHabit = async (habitId) => {
    try {
      await habitService.deleteHabit(habitId)
      fetchData()
    } catch (error) {
      console.error('Failed to delete habit:', error)
    }
  }

  const isCompletedToday = (habitId) => {
    return todayLogs.some(log => log.habit_id === habitId)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracking</h1>
          <p className="text-gray-600 mt-1">Build consistent daily routines</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {showForm && (
        <HabitForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchData()
          }}
        />
      )}

      {habits.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No habits yet</h3>
            <p className="text-gray-600 mt-2">Start building your first habit!</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => {
            const completed = isCompletedToday(habit.id)
            return (
              <Card key={habit.id} className={completed ? 'bg-green-50 border-green-200' : ''}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => !completed && handleLogHabit(habit.id)}
                      disabled={completed}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-primary-100 hover:text-primary-600'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className={`font-semibold ${completed ? 'text-green-700' : 'text-gray-900'}`}>
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-sm text-gray-500">{habit.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Flame className="w-5 h-5" />
                      <span className="font-semibold">{habit.current_streak || 0}</span>
                      <span className="text-sm text-gray-500">streak</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {habit.completion_rate?.toFixed(0) || 0}% rate
                    </div>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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

import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { moodService } from '../../services/moodService'
import Journal from './Journal'
import { Heart, Plus, Smile, Frown, Meh, Zap, Moon } from 'lucide-react'

export default function Mood() {
  const [moodEntries, setMoodEntries] = useState([])
  const [stats, setStats] = useState(null)
  const [showJournal, setShowJournal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [todayMood, setTodayMood] = useState(null)

  const fetchData = async () => {
    try {
      const [entriesData, statsData] = await Promise.all([
        moodService.getMoodEntries(7),
        moodService.getStats(30)
      ])
      setMoodEntries(entriesData)
      setStats(statsData)
      
      const today = new Date().toISOString().split('T')[0]
      const todayEntry = entriesData.find(e => e.logged_at === today)
      setTodayMood(todayEntry)
    } catch (error) {
      console.error('Failed to fetch mood data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogMood = async (moodScore) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await moodService.createMoodEntry({
        mood_score: moodScore,
        energy_level: 5,
        stress_level: 5,
        logged_at: today
      })
      fetchData()
    } catch (error) {
      console.error('Failed to log mood:', error)
    }
  }

  const getMoodIcon = (score) => {
    if (score >= 7) return <Smile className="w-6 h-6 text-green-500" />
    if (score >= 4) return <Meh className="w-6 h-6 text-yellow-500" />
    return <Frown className="w-6 h-6 text-red-500" />
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mood & Journal</h1>
          <p className="text-gray-600 mt-1">Track your emotional wellbeing</p>
        </div>
        <button
          onClick={() => setShowJournal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Write Journal
        </button>
      </div>

      {showJournal && (
        <Journal
          onClose={() => setShowJournal(false)}
          onSuccess={() => {
            setShowJournal(false)
            fetchData()
          }}
        />
      )}

      <Card title="How are you feeling today?" icon={Heart}>
        {todayMood ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-50 rounded-full">
              {getMoodIcon(todayMood.mood_score)}
              <span className="text-lg font-semibold text-primary-700">
                Mood: {todayMood.mood_score}/10
              </span>
            </div>
            <p className="text-gray-500 mt-2">You've logged your mood today!</p>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <button
                key={score}
                onClick={() => handleLogMood(score)}
                className={`w-10 h-10 rounded-full font-semibold transition-colors ${
                  score <= 3 ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                  score <= 6 ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' :
                  'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Avg Mood (30d)</span>
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.avg_mood?.toFixed(1) || '--'}/10</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Avg Energy</span>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.avg_energy?.toFixed(1) || '--'}/10</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Avg Sleep</span>
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.avg_sleep?.toFixed(1) || '--'} hrs</p>
        </Card>
      </div>

      <Card title="Recent Mood Entries">
        {moodEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No mood entries yet</p>
        ) : (
          <div className="divide-y">
            {moodEntries.map((entry) => (
              <div key={entry.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getMoodIcon(entry.mood_score)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.logged_at).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-gray-500">{entry.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{entry.mood_score}/10</p>
                  <p className="text-xs text-gray-500">
                    Energy: {entry.energy_level} • Stress: {entry.stress_level}
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

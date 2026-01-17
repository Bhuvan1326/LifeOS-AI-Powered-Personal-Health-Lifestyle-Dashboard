import { useState } from 'react'
import { moodService } from '../../services/moodService'
import { X } from 'lucide-react'

export default function Journal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    logged_at: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await moodService.createJournalEntry(formData)
      onSuccess()
    } catch (error) {
      console.error('Failed to create journal entry:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Write Journal Entry</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="What's on your mind?"
            />
          </div>

          <div>
            <label className="label">Journal Entry</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input min-h-[150px]"
              placeholder="Write your thoughts..."
              required
            />
          </div>

          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input"
              placeholder="e.g., gratitude, reflection, goals"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

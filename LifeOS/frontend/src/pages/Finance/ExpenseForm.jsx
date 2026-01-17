import { useState } from 'react'
import { financeService } from '../../services/financeService'
import { X } from 'lucide-react'

const EXPENSE_CATEGORIES = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Other']
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']

export default function ExpenseForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Food',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await financeService.createTransaction(formData)
      onSuccess()
    } catch (error) {
      console.error('Failed to create transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: 'Food' })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: 'Salary' })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="label">Amount ($)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="input text-2xl font-bold"
              min={0}
              step={0.01}
              required
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="e.g., Lunch at restaurant"
            />
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

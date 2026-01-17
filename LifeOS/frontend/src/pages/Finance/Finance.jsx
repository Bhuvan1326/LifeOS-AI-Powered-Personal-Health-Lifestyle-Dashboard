import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { financeService } from '../../services/financeService'
import ExpenseForm from './ExpenseForm'
import { DollarSign, Plus, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Finance() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [transData, summaryData, budgetsData] = await Promise.all([
        financeService.getTransactions(30),
        financeService.getMonthlySummary(),
        financeService.getBudgets()
      ])
      setTransactions(transData)
      setSummary(summaryData)
      setBudgets(budgetsData)
    } catch (error) {
      console.error('Failed to fetch finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (transId) => {
    try {
      await financeService.deleteTransaction(transId)
      fetchData()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const expenseData = Object.entries(summary?.expense_by_category || {}).map(([name, value]) => ({
    name,
    value
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {showForm && (
        <ExpenseForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchData()
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Monthly Income</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${summary?.total_income?.toFixed(2) || '0.00'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Monthly Expenses</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            ${summary?.total_expenses?.toFixed(2) || '0.00'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Net Savings</span>
            <PiggyBank className="w-5 h-5 text-blue-500" />
          </div>
          <p className={`text-2xl font-bold ${
            (summary?.net_savings || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            ${summary?.net_savings?.toFixed(2) || '0.00'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Expenses by Category" icon={DollarSign}>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {expenseData.map((entry, index) => (
              <span 
                key={entry.name}
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, color: COLORS[index % COLORS.length] }}
              >
                {entry.name}: ${entry.value.toFixed(0)}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Recent Transactions">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="divide-y max-h-80 overflow-y-auto">
              {transactions.slice(0, 10).map((trans) => (
                <div key={trans.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{trans.description || trans.category}</p>
                    <p className="text-sm text-gray-500">
                      {trans.category} • {new Date(trans.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-semibold ${
                    trans.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trans.type === 'income' ? '+' : '-'}${trans.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {budgets.length > 0 && (
        <Card title="Budget Status">
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percent = (budget.spent / budget.monthly_limit) * 100
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{budget.category}</span>
                    <span className={percent > 100 ? 'text-red-600' : 'text-gray-600'}>
                      ${budget.spent?.toFixed(0) || 0} / ${budget.monthly_limit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percent > 100 ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

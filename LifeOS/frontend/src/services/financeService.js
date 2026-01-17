import api from './api'

export const financeService = {
  async getTransactions(days = 30) {
    const response = await api.get(`/api/finance/transactions?days=${days}`)
    return response.data
  },

  async createTransaction(transactionData) {
    const response = await api.post('/api/finance/transactions', transactionData)
    return response.data
  },

  async updateTransaction(transactionId, transactionData) {
    const response = await api.put(`/api/finance/transactions/${transactionId}`, transactionData)
    return response.data
  },

  async deleteTransaction(transactionId) {
    const response = await api.delete(`/api/finance/transactions/${transactionId}`)
    return response.data
  },

  async getBudgets() {
    const response = await api.get('/api/finance/budgets')
    return response.data
  },

  async createBudget(budgetData) {
    const response = await api.post('/api/finance/budgets', budgetData)
    return response.data
  },

  async deleteBudget(budgetId) {
    const response = await api.delete(`/api/finance/budgets/${budgetId}`)
    return response.data
  },

  async getGoals() {
    const response = await api.get('/api/finance/goals')
    return response.data
  },

  async createGoal(goalData) {
    const response = await api.post('/api/finance/goals', goalData)
    return response.data
  },

  async updateGoal(goalId, goalData) {
    const response = await api.put(`/api/finance/goals/${goalId}`, goalData)
    return response.data
  },

  async getMonthlySummary(month, year) {
    let url = '/api/finance/summary/monthly'
    if (month && year) {
      url += `?month=${month}&year=${year}`
    }
    const response = await api.get(url)
    return response.data
  }
}

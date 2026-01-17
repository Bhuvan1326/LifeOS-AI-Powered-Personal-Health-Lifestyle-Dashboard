import api from './api'

export const habitService = {
  async getHabits() {
    const response = await api.get('/api/habits/')
    return response.data
  },

  async createHabit(habitData) {
    const response = await api.post('/api/habits/', habitData)
    return response.data
  },

  async getHabit(habitId) {
    const response = await api.get(`/api/habits/${habitId}`)
    return response.data
  },

  async updateHabit(habitId, habitData) {
    const response = await api.put(`/api/habits/${habitId}`, habitData)
    return response.data
  },

  async deleteHabit(habitId) {
    const response = await api.delete(`/api/habits/${habitId}`)
    return response.data
  },

  async logHabit(logData) {
    const response = await api.post('/api/habits/log', logData)
    return response.data
  },

  async getTodayLogs() {
    const response = await api.get('/api/habits/logs/today')
    return response.data
  }
}

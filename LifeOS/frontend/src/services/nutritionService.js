import api from './api'

export const nutritionService = {
  async getFoodLogs(days = 7) {
    const response = await api.get(`/api/nutrition/food?days=${days}`)
    return response.data
  },

  async createFoodLog(foodData) {
    const response = await api.post('/api/nutrition/food', foodData)
    return response.data
  },

  async updateFoodLog(foodId, foodData) {
    const response = await api.put(`/api/nutrition/food/${foodId}`, foodData)
    return response.data
  },

  async deleteFoodLog(foodId) {
    const response = await api.delete(`/api/nutrition/food/${foodId}`)
    return response.data
  },

  async getWaterLogs(days = 7) {
    const response = await api.get(`/api/nutrition/water?days=${days}`)
    return response.data
  },

  async logWater(waterData) {
    const response = await api.post('/api/nutrition/water', waterData)
    return response.data
  },

  async getGoals() {
    const response = await api.get('/api/nutrition/goals')
    return response.data
  },

  async updateGoals(goalsData) {
    const response = await api.put('/api/nutrition/goals', goalsData)
    return response.data
  },

  async getDailySummary(date) {
    const response = await api.get(`/api/nutrition/summary/${date}`)
    return response.data
  },

  async getTodayFood() {
    const response = await api.get('/api/nutrition/today')
    return response.data
  }
}

import api from './api'

export const moodService = {
  async getMoodEntries(days = 30) {
    const response = await api.get(`/api/mood/?days=${days}`)
    return response.data
  },

  async createMoodEntry(moodData) {
    const response = await api.post('/api/mood/', moodData)
    return response.data
  },

  async getTodayMood() {
    const response = await api.get('/api/mood/today')
    return response.data
  },

  async updateMoodEntry(moodId, moodData) {
    const response = await api.put(`/api/mood/${moodId}`, moodData)
    return response.data
  },

  async getJournalEntries(days = 30) {
    const response = await api.get(`/api/mood/journal?days=${days}`)
    return response.data
  },

  async createJournalEntry(journalData) {
    const response = await api.post('/api/mood/journal', journalData)
    return response.data
  },

  async updateJournalEntry(journalId, journalData) {
    const response = await api.put(`/api/mood/journal/${journalId}`, journalData)
    return response.data
  },

  async deleteJournalEntry(journalId) {
    const response = await api.delete(`/api/mood/journal/${journalId}`)
    return response.data
  },

  async getStats(days = 30) {
    const response = await api.get(`/api/mood/stats?days=${days}`)
    return response.data
  }
}

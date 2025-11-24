import type { CardProgress } from "./spaced-repetition"

const STORAGE_KEYS = {
  PROGRESS: "vocabulary-progress",
  THEME: "vocabulary-theme",
  STATS: "vocabulary-stats",
}

export interface UserStats {
  totalCardsStudied: number
  totalReviews: number
  streak: number
  lastStudyDate: string
  dailyGoal: number
  dailyProgress: number
}

// Progress Storage
export function saveProgress(progress: CardProgress[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
  }
}

export function loadProgress(): CardProgress[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS)
    return stored ? JSON.parse(stored) : []
  }
  return []
}

export function getCardProgress(wordId: string): CardProgress | undefined {
  const allProgress = loadProgress()
  return allProgress.find((p) => p.wordId === wordId)
}

export function updateCardProgress(card: CardProgress): void {
  const allProgress = loadProgress()
  const index = allProgress.findIndex((p) => p.wordId === card.wordId)

  if (index >= 0) {
    allProgress[index] = card
  } else {
    allProgress.push(card)
  }

  saveProgress(allProgress)
  updateStats()
}

// Theme Storage
export function saveTheme(theme: "light" | "dark"): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }
}

export function loadTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    if (stored === "light" || stored === "dark") {
      return stored
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return "light"
}

// Stats Storage
export function loadStats(): UserStats {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS)
    if (stored) {
      return JSON.parse(stored)
    }
  }

  return {
    totalCardsStudied: 0,
    totalReviews: 0,
    streak: 0,
    lastStudyDate: "",
    dailyGoal: 20,
    dailyProgress: 0,
  }
}

function saveStats(stats: UserStats): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  }
}

export function updateStats(): void {
  const stats = loadStats()
  const today = new Date().toDateString()

  if (stats.lastStudyDate !== today) {
    // New day
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (stats.lastStudyDate === yesterday) {
      stats.streak += 1
    } else if (stats.lastStudyDate !== "") {
      stats.streak = 1
    }
    stats.dailyProgress = 1
    stats.lastStudyDate = today
  } else {
    stats.dailyProgress += 1
  }

  stats.totalReviews += 1
  saveStats(stats)
}

export function getTodayProgress(): { current: number; goal: number; percentage: number } {
  const stats = loadStats()
  const today = new Date().toDateString()

  const current = stats.lastStudyDate === today ? stats.dailyProgress : 0
  const goal = stats.dailyGoal
  const percentage = Math.min(100, Math.round((current / goal) * 100))

  return { current, goal, percentage }
}

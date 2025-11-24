"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { loadVocabulary, shuffleArray, type VocabularyWord } from "@/lib/vocabulary"
import { BookOpen, RotateCcw, Trophy } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { StudyCard } from "@/components/study-card"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { FilterPanel } from "@/components/filter-panel"
import { loadProgress, saveProgress, loadStats, updateCardProgress } from "@/lib/storage"
import {
  calculateNextReview,
  getDueCards,
  getStudyStats,
  initializeCard,
  type ReviewQuality,
  type CardProgress,
} from "@/lib/spaced-repetition"

export default function Home() {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [allProgress, setAllProgress] = useState<CardProgress[]>([])
  const [dueCards, setDueCards] = useState<VocabularyWord[]>([])
  const [userStats, setUserStats] = useState(loadStats())

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [allTypes, setAllTypes] = useState<string[]>([])

  useEffect(() => {
    loadWords()
  }, [])

  useEffect(() => {
    if (words.length > 0) {
      filterAndLoadDueCards()
    }
  }, [selectedTags, selectedTypes, words, allProgress])

  const loadWords = async () => {
    setIsLoading(true)
    const loadedWords = await loadVocabulary()
    setWords(loadedWords)

    const tags = [...new Set(loadedWords.map((w) => w.tag))].sort()
    const types = [...new Set(loadedWords.map((w) => w.type))].sort()
    setAllTags(tags)
    setAllTypes(types)

    const progress = loadProgress()
    setAllProgress(progress)

    const wordsWithProgress = loadedWords.map((word) => {
      const wordId = `${word.word}-${word.translation}`
      let cardProgress = progress.find((p) => p.wordId === wordId)

      if (!cardProgress) {
        cardProgress = initializeCard(wordId)
        progress.push(cardProgress)
      }

      return { word, progress: cardProgress }
    })

    saveProgress(progress)
    setIsLoading(false)
  }

  const filterAndLoadDueCards = () => {
    let filteredWords = [...words]

    if (selectedTags.length > 0) {
      filteredWords = filteredWords.filter((w) => selectedTags.includes(w.tag))
    }

    if (selectedTypes.length > 0) {
      filteredWords = filteredWords.filter((w) => selectedTypes.includes(w.type))
    }

    const dueProgressCards = getDueCards(allProgress)
    const due = filteredWords.filter((word) => {
      const wordId = `${word.word}-${word.translation}`
      return dueProgressCards.some((dp) => dp.wordId === wordId)
    })

    setDueCards(shuffleArray(due))
    setCurrentIndex(0)
    setIsComplete(false)
  }

  const handleReview = (quality: ReviewQuality) => {
    const currentWord = dueCards[currentIndex]
    const wordId = `${currentWord.word}-${currentWord.translation}`

    const currentProgress = allProgress.find((p) => p.wordId === wordId)
    if (!currentProgress) return

    const updatedProgress = calculateNextReview(currentProgress, quality)
    updateCardProgress(updatedProgress)

    const newAllProgress = allProgress.map((p) => (p.wordId === wordId ? updatedProgress : p))
    setAllProgress(newAllProgress)
    setUserStats(loadStats())

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handleRestart = () => {
    loadWords()
    setCurrentIndex(0)
    setIsComplete(false)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleClearFilters = () => {
    setSelectedTags([])
    setSelectedTypes([])
  }

  const studyStats = getStudyStats(allProgress)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка словаря...</p>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">Словарь пуст</h2>
          <p className="text-muted-foreground mb-6">Добавьте CSV файлы с словами в папку public/voc/</p>
          <Button onClick={loadWords}>Перезагрузить</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1" />
            <div className="inline-flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Vocabulary Learning</h1>
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
          <p className="text-muted-foreground">Изучайте слова с интервальным повторением</p>
        </header>

        <div className="max-w-6xl mx-auto mb-8">
          <ProgressDashboard stats={studyStats} userStats={userStats} />
        </div>

        <div className="max-w-2xl mx-auto">
          <FilterPanel
            allTags={allTags}
            allTypes={allTypes}
            selectedTags={selectedTags}
            selectedTypes={selectedTypes}
            onTagToggle={handleTagToggle}
            onTypeToggle={handleTypeToggle}
            onClearFilters={handleClearFilters}
          />

          {dueCards.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-8">
                <Trophy className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-4">Отлично!</h2>
                <p className="text-lg text-muted-foreground mb-2">
                  {selectedTags.length > 0 || selectedTypes.length > 0
                    ? "Нет карточек для повторения с выбранными фильтрами"
                    : "Нет карточек для повторения"}
                </p>
                <p className="text-sm text-muted-foreground">Возвращайтесь позже для следующего повторения</p>
              </div>
              <Button onClick={handleRestart} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Обновить
              </Button>
            </div>
          ) : isComplete ? (
            <div className="text-center py-16">
              <div className="mb-8">
                <Trophy className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-4">Сессия завершена!</h2>
                <p className="text-lg text-muted-foreground">Вы завершили все карточки на сегодня</p>
              </div>
              <Button onClick={handleRestart} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Начать заново
              </Button>
            </div>
          ) : (
            <StudyCard
              word={dueCards[currentIndex]}
              progress={
                allProgress.find(
                  (p) => p.wordId === `${dueCards[currentIndex].word}-${dueCards[currentIndex].translation}`,
                ) || initializeCard("")
              }
              onReview={handleReview}
              currentIndex={currentIndex}
              totalCards={dueCards.length}
            />
          )}
        </div>

        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>Система интервального повторения • Прогресс сохраняется автоматически</p>
        </footer>
      </div>
    </div>
  )
}

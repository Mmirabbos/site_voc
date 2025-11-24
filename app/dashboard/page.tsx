"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Loader2, BookOpen, Trophy, Upload, Settings, FileText } from "lucide-react"
import { StudyCard } from "@/components/study-card"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { AddWordDialog } from "@/components/add-word-dialog"
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

type Word = {
  id: string
  original: string
  translation: string
  type: string
  tag: string
  easiness_factor: number
  interval: number
  repetitions: number
  next_review: string
}

export default function Dashboard() {
  const [words, setWords] = useState<Word[]>([]) 
  const [dueWords, setDueWords] = useState<Word[]>([]) 
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  
  // Состояния диалогов
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  
  const [sessionCount, setSessionCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    setUserName(user.user_metadata?.full_name || "Студент")
    setUserEmail(user.email || "")

    const { data: wordsData } = await supabase
      .from("words")
      .select("*")
      .order("created_at", { ascending: false })

    if (wordsData) {
      setWords(wordsData)
      updateDueWords(wordsData)
    }
    setLoading(false)
  }

  const updateDueWords = (allWords: Word[]) => {
    const now = new Date()
    const due = allWords
      .filter((w) => new Date(w.next_review) <= now)
      .sort((a, b) => new Date(a.next_review).getTime() - new Date(b.next_review).getTime())
    setDueWords(due)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleWordAdded = (newWord: Word) => {
    const updatedWords = [newWord, ...words]
    setWords(updatedWords)
    if (new Date(newWord.next_review) <= new Date()) {
      setDueWords((prev) => [...prev, newWord])
    }
    setShowAddDialog(false)
  }

  const handleWordReviewed = async (id: string, quality: number) => {
    const word = words.find((w) => w.id === id)
    if (!word) return

    let { easiness_factor, interval, repetitions } = word
    const now = new Date()
    let nextReview = new Date(now)
    let keepInSession = false 

    // --- АЛГОРИТМ SM-2 (Упрощенный) ---
    if (quality === 1) { // Again
      interval = 0
      repetitions = 0
      nextReview.setMinutes(now.getMinutes() + 1)
      keepInSession = true 
    } else if (quality === 3) { // Hard
      interval = 0
      nextReview.setMinutes(now.getMinutes() + 10)
    } else if (quality === 4) { // Good
      interval = repetitions === 0 ? 1 : Math.round(interval * easiness_factor)
      if (interval < 1) interval = 1
      repetitions += 1
      easiness_factor += 0.1 
      nextReview.setDate(now.getDate() + 1)
      if (repetitions > 1) {
         nextReview = new Date(now)
         nextReview.setDate(now.getDate() + interval)
      }
    } else if (quality === 5) { // Easy
      interval = Math.max(3, Math.round(interval * easiness_factor * 1.3))
      repetitions += 1
      easiness_factor += 0.2
      nextReview.setDate(now.getDate() + 3)
      if (repetitions > 1) {
          nextReview = new Date(now)
          nextReview.setDate(now.getDate() + interval)
      }
    }

    if (keepInSession) {
      const updatedWord = { ...word, next_review: nextReview.toISOString() }
      setDueWords((prev) => {
        const filtered = prev.filter(w => w.id !== id)
        return [...filtered, updatedWord] 
      })
    } else {
      setDueWords((prev) => prev.filter((w) => w.id !== id))
      if (quality >= 3) {
         setSessionCount((prev) => prev + 1)
      }
    }

    setWords(prev => prev.map(w => w.id === id ? { ...w, easiness_factor, interval, repetitions, next_review: nextReview.toISOString() } : w))

    await supabase
      .from("words")
      .update({
        easiness_factor,
        interval,
        repetitions,
        next_review: nextReview.toISOString(),
      })
      .eq("id", id)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim() !== '')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const newWords = []
      for (const line of lines) {
        const parts = line.split(/[,;]/) 
        if (parts.length >= 2) {
          newWords.push({
            original: parts[0].trim(),
            translation: parts[1].trim(),
            user_id: user.id,
            type: 'Noun',
            tag: 'Imported',
            next_review: new Date().toISOString()
          })
        }
      }
      if (newWords.length > 0) {
        const { error } = await supabase.from('words').insert(newWords)
        if (!error) {
          alert(`Успешно добавлено ${newWords.length} слов!`)
          fetchData()
        } else {
          alert("Ошибка при импорте.")
        }
      }
      setUploading(false)
    }
    reader.readAsText(file)
  }

  const stats = {
    total: words.length,
    new: words.filter(w => w.repetitions === 0).length,
    learning: words.filter(w => w.repetitions > 0 && w.interval < 15).length,
    review: dueWords.length, 
    mastered: words.filter(w => w.interval >= 15).length, 
  }

  const userStats = {
    dailyGoal: 20,
    dailyProgress: sessionCount, 
    streak: 1, 
    totalReviews: sessionCount
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 pb-20">
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
            <span>VocabApp</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ЛЕВАЯ КОЛОНКА (ОСНОВНАЯ) */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-3xl font-extrabold tracking-tight">Учёба</h1>
                   <p className="text-muted-foreground">В очереди {dueWords.length} слов.</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> Добавить слово
                </Button>
             </div>

             <ProgressDashboard stats={stats} userStats={userStats} />

             <div className="flex justify-center">
               <div className="w-full max-w-xl">
                 {dueWords.length > 0 ? (
                    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border min-h-[400px] flex items-center justify-center p-6">
                        <div className="absolute top-4 right-4 text-xs font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                           Очередь: {dueWords.length}
                        </div>
                        <StudyCard 
                          word={dueWords[0]} 
                          onResult={(quality) => handleWordReviewed(dueWords[0].id, quality)} 
                        />
                    </div>
                 ) : (
                   <Card className="text-center py-12 border-dashed bg-transparent shadow-none">
                     <CardContent className="flex flex-col items-center gap-4">
                       <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                          <Trophy className="h-8 w-8 text-green-600 dark:text-green-500" />
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xl font-bold">Всё выучено! 🎉</h3>
                          <p className="text-muted-foreground">На данный момент повторять нечего.</p>
                       </div>
                     </CardContent>
                   </Card>
                 )}
               </div>
             </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (САЙДБАР) */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Профиль */}
             <Card>
                <CardHeader className="pb-2">
                   <CardTitle className="text-lg">Профиль</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                         <AvatarImage src="" />
                         <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                            {userName.charAt(0).toUpperCase()}
                         </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                         <p className="font-bold truncate">{userName}</p>
                         <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                      </div>
                   </div>
                   <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => setShowSettingsDialog(true)}
                   >
                      <Settings className="mr-2 h-4 w-4" /> Настройки профиля
                   </Button>
                   <Separator />
                   <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" size="sm" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Выйти
                   </Button>
                </CardContent>
             </Card>

             {/* Импорт */}
             <Card>
                <CardHeader className="pb-2">
                   <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Импорт слов
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground">
                      Загрузи CSV файл (формат: <code>word,translation</code>).
                   </p>
                   <input 
                      type="file" 
                      accept=".csv,.txt" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload} 
                   />
                   <Button 
                      className="w-full" 
                      disabled={uploading} 
                      onClick={() => fileInputRef.current?.click()}
                   >
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Загрузить CSV
                   </Button>
                </CardContent>
             </Card>

             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm text-indigo-800 dark:text-indigo-200">
                <p className="font-bold mb-1">💡 Алгоритм:</p>
                <ul className="list-disc list-inside space-y-1 opacity-80 text-xs">
                   <li><b>Again:</b> Повтор сейчас</li>
                   <li><b>Hard:</b> Повтор через 10 мин</li>
                   <li><b>Good:</b> Повтор завтра</li>
                   <li><b>Easy:</b> Повтор через 3 дня</li>
                   <li className="mt-2 pt-2 border-t border-indigo-200">
                      <i>Выученным</i> считается слово с интервалом больше 14 дней.
                   </li>
                </ul>
             </div>

          </div>
        </div>
      </main>

      {/* ДИАЛОГОВЫЕ ОКНА */}
      <AddWordDialog open={showAddDialog} onOpenChange={setShowAddDialog} onWordAdded={handleWordAdded} />
      
      <ProfileSettingsDialog 
        open={showSettingsDialog} 
        onOpenChange={setShowSettingsDialog} 
        currentName={userName}
        onProfileUpdated={(newName) => setUserName(newName)}
      />

    </div>
  )
}
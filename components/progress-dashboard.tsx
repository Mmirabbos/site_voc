"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Flame, BarChart3 } from "lucide-react"

interface ProgressDashboardProps {
  stats: {
    new?: number // Добавил ? чтобы параметры были необязательными
    learning?: number
    review?: number
    mastered: number
    total: number
    dueToday?: number
  }
  userStats: {
    streak: number
    totalReviews?: number
    dailyProgress: number
    dailyGoal: number
  }
}

export function ProgressDashboard({ stats, userStats }: ProgressDashboardProps) {
  // --- ЗАЩИТА: Если данных нет, ничего не рисуем (и не ломаем сайт) ---
  if (!stats || !userStats) {
    return null;
  }
  // ------------------------------------------------------------------

  const progressPercentage = Math.min(100, Math.round((userStats.dailyProgress / userStats.dailyGoal) * 100))
  const masteredPercentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Daily Progress */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">Ежедневная цель</div>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {userStats.dailyProgress} / {userStats.dailyGoal}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* Streak */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">Серия дней</div>
        </div>
        <div className="text-2xl font-bold">
          {userStats.streak} {userStats.streak === 1 ? "день" : "дней"}
        </div>
      </Card>

      {/* Mastered Words */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Trophy className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">Выучено слов</div>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {stats.mastered} / {stats.total}
          </div>
          <Progress value={masteredPercentage} className="h-2" />
        </div>
      </Card>

      {/* Total Reviews */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">Всего повторений</div>
        </div>
        <div className="text-2xl font-bold">{userStats.totalReviews || 0}</div>
      </Card>
    </div>
  )
}
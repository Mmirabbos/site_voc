"use client"

import { Card } from "@/components/ui/card"

interface StatsCardProps {
  known: number
  unknown: number
  total: number
}

export function StatsCard({ known, unknown, total }: StatsCardProps) {
  const percentage = total > 0 ? Math.round((known / total) * 100) : 0

  return (
    <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Статистика</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-secondary">{known}</div>
          <div className="text-sm text-muted-foreground">Знаю</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-destructive">{unknown}</div>
          <div className="text-sm text-muted-foreground">Не знаю</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{percentage}%</div>
          <div className="text-sm text-muted-foreground">Прогресс</div>
        </div>
      </div>
    </Card>
  )
}

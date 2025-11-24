"use client"

import { useState, useEffect } from "react"
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

interface StudyCardProps {
  word: Word
  onResult: (quality: number) => void
}

export function StudyCard({ word, onResult }: StudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Сбрасываем переворот, когда появляется новое слово
  useEffect(() => {
    setIsFlipped(false)
  }, [word])

  const status = word.repetitions === 0 ? "new" : "review"

  const getStatusColor = () => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900"
      case "review":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case "new": return "Новое слово"
      case "review": return "Повторение"
      default: return ""
    }
  }

  return (
    <div className="w-full h-full min-h-[350px]" style={{ perspective: "1000px" }}>
      <div 
        className="relative w-full h-full transition-all duration-500 cursor-pointer"
        style={{ 
          transformStyle: "preserve-3d", 
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
        }}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        {/* --- ЛИЦЕВАЯ СТОРОНА (Передняя) --- */}
        <Card 
          className="absolute w-full h-full flex flex-col justify-between p-6 md:p-10 border-2"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={cn("px-3 py-1 font-medium border", getStatusColor())}>
              {getStatusLabel()}
            </Badge>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              <span className="bg-secondary px-2 py-1 rounded">{word.tag || "General"}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center mt-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2">
                {word.original}
              </h2>
              <p className="text-lg text-muted-foreground font-medium italic">
                {word.type || "word"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Нажми, чтобы увидеть перевод
            </p>
          </div>
        </Card>

        {/* --- ОБРАТНАЯ СТОРОНА (Задняя) --- */}
        <Card 
          className="absolute w-full h-full flex flex-col justify-between p-6 md:p-10 border-2 bg-slate-50 dark:bg-zinc-900"
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" 
          }}
        >
          <div className="flex justify-center">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Перевод
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              {word.translation}
            </h2>
            <div className="w-16 h-1 bg-indigo-100 dark:bg-indigo-900 rounded-full"></div>
          </div>

          {/* КНОПКИ ОЦЕНКИ - ИМЕННО ОНИ ПЕРЕКЛЮЧАЮТ СЛОВО */}
          <CardFooter className="flex flex-col gap-4 p-0 mt-6">
            <div className="grid grid-cols-4 gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                onClick={(e) => { e.stopPropagation(); onResult(1); }}
              >
                <span className="font-bold">Again</span>
                <span className="text-[10px] text-muted-foreground">1 мин</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                onClick={(e) => { e.stopPropagation(); onResult(3); }}
              >
                <span className="font-bold">Hard</span>
                <span className="text-[10px] text-muted-foreground">10 мин</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                onClick={(e) => { e.stopPropagation(); onResult(4); }}
              >
                <span className="font-bold">Good</span>
                <span className="text-[10px] text-muted-foreground">1 день</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                onClick={(e) => { e.stopPropagation(); onResult(5); }}
              >
                <span className="font-bold">Easy</span>
                <span className="text-[10px] text-muted-foreground">4 дня</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
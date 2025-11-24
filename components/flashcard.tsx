"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { VocabularyWord } from "@/lib/vocabulary"
import { cn } from "@/lib/utils"

interface FlashcardProps {
  word: VocabularyWord
  onNext: () => void
  onKnow: () => void
  onDontKnow: () => void
  currentIndex: number
  totalCards: number
}

export function Flashcard({ word, onNext, onKnow, onDontKnow, currentIndex, totalCards }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleKnow = () => {
    onKnow()
    setIsFlipped(false)
  }

  const handleDontKnow = () => {
    onDontKnow()
    setIsFlipped(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Карточка {currentIndex + 1} из {totalCards}
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {word.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {word.tag}
          </Badge>
        </div>
      </div>

      <div className="relative h-[400px] cursor-pointer perspective-1000" onClick={handleFlip}>
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-500 transform-style-3d",
            isFlipped ? "rotate-y-180" : "",
          )}
        >
          {/* Front of card */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden flex items-center justify-center p-8",
              "bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10",
              "border-2 hover:shadow-xl transition-shadow",
            )}
          >
            <div className="text-center">
              <div className="text-6xl font-bold text-foreground mb-4">{word.word}</div>
              <div className="text-sm text-muted-foreground">Нажмите, чтобы увидеть перевод</div>
            </div>
          </Card>

          {/* Back of card */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-8",
              "bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/10",
              "border-2 hover:shadow-xl transition-shadow",
            )}
          >
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground mb-6">{word.translation}</div>
              <div className="text-3xl text-muted-foreground mb-4">{word.word}</div>
              <div className="text-sm text-muted-foreground">Нажмите, чтобы вернуться</div>
            </div>
          </Card>
        </div>
      </div>

      {isFlipped && (
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDontKnow()
            }}
            className="px-8 py-3 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium"
          >
            Не знаю
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleKnow()
            }}
            className="px-8 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors font-medium"
          >
            Знаю
          </button>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}

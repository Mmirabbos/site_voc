"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Filter, X } from "lucide-react"
import { useState } from "react"

interface FilterPanelProps {
  allTags: string[]
  allTypes: string[]
  selectedTags: string[]
  selectedTypes: string[]
  onTagToggle: (tag: string) => void
  onTypeToggle: (type: string) => void
  onClearFilters: () => void
}

export function FilterPanel({
  allTags,
  allTypes,
  selectedTags,
  selectedTypes,
  onTagToggle,
  onTypeToggle,
  onClearFilters,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasActiveFilters = selectedTags.length > 0 || selectedTypes.length > 0

  if (!isOpen) {
    return (
      <div className="flex justify-center mb-6">
        <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2">
          <Filter className="h-4 w-4" />
          Фильтры
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {selectedTags.length + selectedTypes.length}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Фильтры</h3>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Сбросить
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Скрыть
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Категории</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Типы слов</h4>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => onTypeToggle(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

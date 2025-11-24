"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

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

interface AddWordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWordAdded: (word: Word) => void
}

export function AddWordDialog({ open, onOpenChange, onWordAdded }: AddWordDialogProps) {
  const [original, setOriginal] = useState("")
  const [translation, setTranslation] = useState("")
  const [type, setType] = useState("Noun")
  const [tag, setTag] = useState("General")
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const handleSave = async () => {
    if (!original || !translation) return

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const newWordData = {
        original,
        translation,
        type,
        tag,
        user_id: user.id,
        easiness_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("words")
        .insert([newWordData])
        .select()
        .single()

      if (error) {
        console.error("Ошибка сохранения:", error)
        alert("Ошибка! Проверь консоль.")
      } else if (data) {
        onWordAdded(data)
        setOriginal("")
        setTranslation("")
      }
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="original">Word (English)</Label>
              <Input 
                id="original" 
                placeholder="Hello" 
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="translation">Translation</Label>
              <Input 
                id="translation" 
                placeholder="Привет" 
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Noun">Noun (Сущ.)</SelectItem>
                  <SelectItem value="Verb">Verb (Глагол)</SelectItem>
                  <SelectItem value="Adjective">Adjective (Прил.)</SelectItem>
                  <SelectItem value="Phrase">Phrase (Фраза)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input 
                id="tag" 
                placeholder="General" 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Word
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface ProfileSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  onProfileUpdated: (newName: string) => void
}

export function ProfileSettingsDialog({ open, onOpenChange, currentName, onProfileUpdated }: ProfileSettingsDialogProps) {
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Обновляем поле ввода, если имя снаружи изменилось
  useEffect(() => {
    setName(currentName)
  }, [currentName])

  const handleSave = async () => {
    setLoading(true)

    // Обновляем данные пользователя в Supabase
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    })

    if (error) {
      alert("Ошибка обновления профиля")
      console.error(error)
    } else {
      onProfileUpdated(name) // Сообщаем Дашборду новое имя
      onOpenChange(false) // Закрываем окно
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ваше имя</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export interface VocabularyWord {
  word: string
  translation: string
  type: string
  tag: string
}

export async function loadVocabulary(): Promise<VocabularyWord[]> {
  const words: VocabularyWord[] = []

  try {
    const csvFiles = ["basic-words.csv", "intermediate-words.csv"]

    for (const file of csvFiles) {
      try {
        const response = await fetch(`/voc/${file}`)

        if (!response.ok) {
          console.log(`Skipping ${file} - not found`)
          continue
        }

        const csvText = await response.text()
        const lines = csvText.split("\n")

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const [word, translation, type, tag] = line.split(",").map((s) => s.trim())

          if (word && translation && type && tag) {
            words.push({ word, translation, type, tag })
          }
        }
      } catch (fileError) {
        console.log(`Error loading ${file}:`, fileError)
      }
    }
  } catch (error) {
    console.error("Error loading vocabulary:", error)
  }

  return words
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

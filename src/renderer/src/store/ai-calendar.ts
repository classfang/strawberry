import { nowTimestamp } from '@renderer/utils/date-util'
import { generateUUID } from '@renderer/utils/id-util'
import { defineStore } from 'pinia'

export const useAICalendarStore = defineStore('ai-calendar', {
  state: () => ({
    dayNotes: {} as Record<string, CalendarNote>
  }),
  getters: {
    getStoreJson(): string {
      return JSON.stringify({
        dayNotes: this.dayNotes
      })
    }
  },
  actions: {
    setStoreFromJson(jsonStr: string, override = false) {
      let importCount = 0
      if (!jsonStr) {
        return importCount
      }
      const json = JSON.parse(jsonStr)
      if (json.dayNotes !== undefined) {
        if (override) {
          this.dayNotes = json.dayNotes
        } else {
          Object.keys(json.dayNotes).forEach((key) => {
            this.dayNotes[key] = json.dayNotes[key]
          })
        }
        importCount = Object.keys(json.dayNotes).length
      }
      return importCount
    },
    clear() {
      this.dayNotes = {}
    },
    newNote(params: { time: string; content: string }) {
      this.dayNotes[params.time] = {
        id: generateUUID(),
        content: params.content,
        createTime: nowTimestamp()
      }
    },
    saveNote(params: { time: string; content: string }) {
      if (this.dayNotes[params.time]) {
        this.dayNotes[params.time].content = params.content
      } else {
        this.newNote(params)
      }
    },
    appendNote(params: { time: string; content: string }) {
      if (this.dayNotes[params.time]) {
        this.dayNotes[params.time].content += `\n\n${params.content}`
      } else {
        this.newNote(params)
      }
    }
  },
  persist: true
})

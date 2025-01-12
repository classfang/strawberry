import { nowTimestamp } from '@renderer/utils/date-util'
import { generateUUID } from '@renderer/utils/id-util'
import { defineStore } from 'pinia'

export const useChatMemoryStore = defineStore('chat-memory', {
  state: () => ({
    memoryList: [] as ChatMemory[]
  }),
  getters: {
    getStoreJson(): string {
      return JSON.stringify({
        memoryList: this.memoryList
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
      if (json.memoryList !== undefined) {
        if (override) {
          this.memoryList = json.memoryList
        } else {
          this.memoryList = this.memoryList.concat(json.memoryList)
        }
        importCount = json.memoryList.length
      }
      return importCount
    },
    add(content: string) {
      this.memoryList.unshift({
        id: generateUUID(),
        createTime: nowTimestamp(),
        content: content
      })
    },
    deleteById(id: string) {
      this.memoryList = this.memoryList.filter((memory) => memory.id != id)
    },
    clear() {
      this.memoryList = []
    }
  },
  persist: true
})

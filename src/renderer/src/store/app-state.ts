import {
  getCachePathSync,
  onMainWindowBlur,
  onMainWindowFocus
} from '@renderer/service/ipc-service'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'

export const useAppStateStore = defineStore('app-state', {
  state: () => ({
    mainWindowFocusFlag: true,
    chatLoadingFlag: false,
    chatSearchingFlag: false,
    chatAnswerFlag: false,
    currentToolName: null as null | string,
    uploadFlag: false,
    loadFileFlag: false,
    readWebFlag: false,
    cleanCacheFlag: false,
    exportChatFlag: false,
    importChatFlag: false,
    exportMemoryFlag: false,
    importMemoryFlag: false,
    exportSettingFlag: false,
    importSettingFlag: false,
    exportCalendarFlag: false,
    importCalendarFlag: false,
    dayKey: dayjs().format('YYYYMMDD'),
    cachePath: getCachePathSync(),
    appSettingDialogVisible: false,
    archivedDataDialogVisible: false
  }),
  actions: {
    startStateKeyInterval() {
      // 刷新 dayKey，用于更具日期自动刷新组件
      setInterval(() => {
        this.dayKey = dayjs().format('YYYYMMDD')
      }, 1000)
    },
    startListenWindowFocus() {
      onMainWindowFocus(() => {
        this.mainWindowFocusFlag = true
      })
      onMainWindowBlur(() => {
        this.mainWindowFocusFlag = false
      })
    }
  },
  persist: false
})

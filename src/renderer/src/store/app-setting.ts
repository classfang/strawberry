import { isZH } from '@renderer/utils/window-util'
import { defineStore } from 'pinia'

export const useAppSettingStore = defineStore('app-setting', {
  state: () => ({
    app: {
      // 主题模式：0自动 1明亮 2黑暗
      themeModel: 0,
      // 本地化
      locale: isZH() ? 'zh_CN' : 'en_US',
      // 网络代理
      proxy: '',
      // 最后版本检查时间
      lastCheckVersionTime: 0
    },
    // https://platform.openai.com/docs/api-reference/chat/create
    openAI: {
      // 服务配置
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',

      // 对话配置
      chatOption: {
        model: 'gpt-4o',
        temperature: 1,
        topP: 1,
        maxCompletionTokens: 4096,
        presencePenalty: 0,
        frequencyPenalty: 0,
        contextSize: 5,
        autoGenerateSessionName: true
      },

      // 发音配置
      speechOption: {
        model: 'tts-1',
        voice: 'alloy',
        speed: 1
      } as SpeechOption,

      // 文生图配置
      textToImageOption: {
        enabled: false,
        model: 'dall-e-3',
        n: 1,
        quality: 'standard',
        size: '1024x1024',
        style: 'vivid'
      } as TextToImageOption
    },
    chat: {
      sidebarVisible: true
    },
    memoryOption: {
      enabled: false
    },
    internetSearchOption: {
      enabled: false,
      count: 3
    },
    calendarOption: {
      queryEnabled: true,
      addEnabled: true
    }
  }),
  getters: {
    getStoreJson(): string {
      return JSON.stringify({
        app: this.app,
        openAI: this.openAI,
        chat: this.chat,
        internetSearchOption: this.internetSearchOption,
        calendarOption: this.calendarOption
      })
    }
  },
  actions: {
    setStoreFromJson(jsonStr: string) {
      let importFlag = false
      if (!jsonStr) {
        return importFlag
      }
      const json = JSON.parse(jsonStr)
      if (json.app !== undefined) {
        this.app = json.app
        importFlag = true
      }
      if (json.openAI !== undefined) {
        this.openAI = json.openAI
        importFlag = true
      }
      if (json.chat !== undefined) {
        this.chat = json.chat
        importFlag = true
      }
      if (json.internetSearchOption !== undefined) {
        this.internetSearchOption = json.internetSearchOption
        importFlag = true
      }
      if (json.calendar !== undefined) {
        this.calendarOption = json.calendarOption
        importFlag = true
      }
      return importFlag
    }
  },
  persist: true
})

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

type LLMProvider = 'OpenAI'

type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

type ChatMessageType = 'chat' | 'error' | 'divider'

interface BaseEntity {
  id?: string
  createTime?: number
}

interface ChatMessageFile {
  name: string
  saveName: string
  extname: string
  size?: number
}

interface SelectFile {
  name: string
  extname: string
  path?: string
  base64?: string
  size: number
}

interface ChatMessageLink {
  url: string
}

interface ChatMessageChoose {
  content: string
  images?: ChatMessageFile[]
  searchItems?: InternetSearchResultItem[]
}

interface InternetSearchResultItem {
  title: string
  snippet: string
  link: string
  displayLink: string
}

interface ChatMessage extends BaseEntity {
  type: ChatMessageType
  role: ChatRole
  content: string
  images?: ChatMessageFile[]
  files?: ChatMessageFile[]
  links?: ChatMessageLink[]
  searchItems?: InternetSearchResultItem[]
  choices?: ChatMessageChoose[]
  choiceIndex?: number
}

interface ChatOption {
  model: string
  temperature: number
  topP: number
  maxTokens: number
  presencePenalty: number
  frequencyPenalty: number
  contextSize: number
  autoGenerateSessionName: boolean
}

interface SpeechOption {
  model: string
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed: number
}

interface TextToImageOption {
  enabled: boolean
  model: string
  n: number
  quality: 'standard' | 'hd'
  size: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
  style: 'vivid' | 'natural'
}

interface InternetSearchOption {
  enabled: boolean
  google: {
    baseUrl: string
    key: string
    cx: string
  }
}

interface MemoryOption {
  enabled: boolean
}

interface ChatMemory extends BaseEntity {
  content: string
}

interface ChatUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

interface ChatSession extends BaseEntity {
  name: string
  provider: LLMProvider
  messages: ChatMessage[]
  usage?: ChatUsage
  new: boolean
  archived: boolean
  chatOption: ChatOption
  speechOption: SpeechOption
  textToImageOption: TextToImageOption
  memoryOption: MemoryOption
  internetSearchOption: InternetSearchOption
}

interface DesktopScreenshot {
  id: string
  name: string
  appIcon?: string
  thumbnail: string
}

interface CalendarNote extends BaseEntity {
  content: string
  starred?: boolean
}

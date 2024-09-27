import { useAICalendarStore } from '@renderer/store/ai-calendar'
import { useAppSettingStore } from '@renderer/store/app-setting'
import { useAppStateStore } from '@renderer/store/app-state'
import { useChatMemoryStore } from '@renderer/store/chat-memory'
import { useChatSessionStore } from '@renderer/store/chat-session'

export const useStore = () => {
  const appStateStore = useAppStateStore()
  const appSettingStore = useAppSettingStore()
  const chatSessionStore = useChatSessionStore()
  const chatMemoryStore = useChatMemoryStore()
  const aiCalendarStore = useAICalendarStore()

  return { appStateStore, appSettingStore, chatSessionStore, chatMemoryStore, aiCalendarStore }
}

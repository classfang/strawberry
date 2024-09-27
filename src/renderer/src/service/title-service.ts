import { AppConfig } from '@renderer/config/AppConfig'
import { useStore } from '@renderer/store/store'
import { onMounted, watch } from 'vue'

export const useTitle = () => {
  // 仓库
  const { chatSessionStore } = useStore()

  // 设置会话名称为标题
  const setSessionNameTitle = () => {
    document.title = chatSessionStore.getActiveSession?.name || AppConfig.name
  }

  // 监听标题
  watch(
    () => chatSessionStore.getActiveSession?.name,
    () => {
      setSessionNameTitle()
    }
  )

  onMounted(() => {
    // 设置标题
    setSessionNameTitle()
  })
}

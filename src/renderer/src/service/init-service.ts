import { useStore } from '@renderer/store/store'
import { onMounted } from 'vue'

export const useInit = () => {
  // 仓库
  const { appStateStore } = useStore()

  onMounted(() => {
    // 监听主窗口焦点状态
    appStateStore.startListenWindowFocus()
  })
}

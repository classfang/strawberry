import { setThemeSource } from '@renderer/service/ipc-service'
import { useStore } from '@renderer/store/store'
import { startDarkThemeListener } from '@renderer/utils/window-util'
import { useDark } from '@vueuse/core'
import { onMounted, watch } from 'vue'

// 停止监听函数
let stopDarkThemeListener: any = null

export const useTheme = () => {
  // 仓库
  const { appSettingStore } = useStore()

  // 是否是黑暗模式
  const isDark = useDark()

  // 主题设置监听
  watch(
    () => appSettingStore.app.themeModel,
    () => {
      updateTheme()
    }
  )

  // 更新主题
  const updateTheme = () => {
    if (stopDarkThemeListener) {
      stopDarkThemeListener()
    }

    // 设置主进程主题
    setThemeSource(['system', 'light', 'dark'].at(appSettingStore.app.themeModel))

    // 跟随系统
    if (appSettingStore.app.themeModel === 0) {
      stopDarkThemeListener = startDarkThemeListener((isDarkValue: boolean) => {
        isDark.value = isDarkValue
      })
    } else {
      // 切换样式
      isDark.value = appSettingStore.app.themeModel === 2
    }
  }

  onMounted(() => {
    // 更新主题
    updateTheme()
  })
}

import { useStore } from '@renderer/store/store'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Element Plus 国际化
const elementPlusLocales = {
  zh_CN: zhCn,
  en_US: en
}

export const useLocal = () => {
  // 仓库
  const { appSettingStore } = useStore()

  // 国际化
  const { locale } = useI18n()

  // Element Plus 当前语言
  const elementPlusLocale = computed(() => {
    return elementPlusLocales[appSettingStore.app.locale]
  })

  // 语言设置监听
  watch(
    () => appSettingStore.app.locale,
    (lang) => {
      locale.value = lang
    }
  )

  onMounted(() => {
    // 设置语言
    locale.value = appSettingStore.app.locale
  })

  return { elementPlusLocale }
}

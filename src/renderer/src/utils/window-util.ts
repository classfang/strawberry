export const openInBrowser = (url: string | undefined) => {
  if (!url) {
    return
  }
  window.open(url)
}

export const isZH = (): boolean => {
  return !!navigator.languages.at(0)?.startsWith('zh')
}

export const getSelectedText = (defaultText: string) => {
  const text = window.getSelection()?.toString()
  return text == undefined || text == '' ? defaultText : text
}

export const startDarkThemeListener = (handle: (isDark: boolean) => void) => {
  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')

  const handleColorSchemeChange = (e: any) => {
    handle(e.matches)
  }

  // 添加事件监听器
  darkThemeMq.addEventListener('change', handleColorSchemeChange)

  // 初始加载时执行一次以设置初始主题
  handleColorSchemeChange(darkThemeMq)

  // 添加移除事件监听的方法
  return () => {
    darkThemeMq.removeEventListener('change', handleColorSchemeChange)
  }
}

// 通知
export const notification = (title: string, body: string, click?: () => void) => {
  new Notification(title, { body: body }).onclick = () => {
    if (click) {
      click()
    }
  }
}

// 系统类型
export const getOperatingSystem = () => {
  const result = {
    name: 'Unknown',
    isMacOS: false,
    isLinux: false,
    isWindows: false
  }

  const userAgent = window.navigator.userAgent
  if (userAgent.indexOf('Mac') !== -1) {
    result.name = 'macOS'
    result.isMacOS = true
  } else if (userAgent.indexOf('Linux') !== -1) {
    result.name = 'Linux'
    result.isLinux = true
  } else if (userAgent.indexOf('Win') !== -1) {
    result.name = 'Windows'
    result.isWindows = true
  }

  return result
}

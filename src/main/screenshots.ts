import { platform } from '@electron-toolkit/utils'
import { ipcMain, shell, desktopCapturer, screen, systemPreferences } from 'electron'

export const initScreenshots = () => {
  // 检查权限
  ipcMain.handle('check-desktop-screenshots', async () => {
    // 检查权限
    const screenAccessStatus = systemPreferences.getMediaAccessStatus('screen')
    if (screenAccessStatus != 'granted') {
      throw new Error(screenAccessStatus)
    }
  })

  // 打开设置项
  ipcMain.handle('option-desktop-screenshots', async () => {
    // 如果是Mac，打开设置项
    if (platform.isMacOS) {
      await shell.openExternal(
        'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
      )
    }
  })

  // 捕获桌面资源
  ipcMain.handle('get-desktop-screenshots', async () => {
    // 获取屏幕数据源
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: screen.getPrimaryDisplay().size,
      fetchWindowIcons: true
    })

    // 返回资源列表
    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      appIcon: source.appIcon?.toDataURL(),
      thumbnail: source.thumbnail.toDataURL()
    }))
  })
}

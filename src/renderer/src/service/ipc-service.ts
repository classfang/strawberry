import { Platform } from '@electron-toolkit/utils'
import i18n from '@renderer/i18n'
import { Logger } from '@renderer/service/logger-service'
import { ElMessage } from 'element-plus'
import { Stats } from 'fs'

// 多语言
const { t } = i18n.global

const logPrefix = 'ipc-service'

export const showMainWindow = () => {
  Logger.info(logPrefix, 'showMainWindow')
  return window.electron.ipcRenderer.invoke('show-main-window')
}

export const setThemeSource = (themeSource = 'system') => {
  Logger.info(logPrefix, 'setThemeSource', themeSource)
  return window.electron.ipcRenderer.invoke('set-theme-source', themeSource)
}

export const getPlatform = (): Promise<Platform> => {
  Logger.info(logPrefix, 'getPlatform')
  return window.electron.ipcRenderer.invoke('process-platform')
}

export const getCachePathSync = (): string => {
  Logger.info(logPrefix, 'getCachePathSync')
  return window.electron.ipcRenderer.sendSync('get-cache-path')
}

export const openCacheDir = () => {
  Logger.info(logPrefix, 'openCacheDir')
  return window.electron.ipcRenderer.invoke('open-cache-dir')
}

export const openLogDir = () => {
  Logger.info(logPrefix, 'openLogDir')
  return window.electron.ipcRenderer.invoke('open-log-dir')
}

export const setProxy = (proxy: string) => {
  Logger.info(logPrefix, 'setProxy', proxy)
  return window.electron.ipcRenderer.invoke('set-proxy', proxy)
}

export const getAppVersion = () => {
  Logger.info(logPrefix, 'getAppVersion')
  return window.electron.ipcRenderer.invoke('get-app-version')
}

export const saveFileByPath = (imagePath: string, fileName: string) => {
  Logger.info(logPrefix, 'saveFileByPath', imagePath, fileName)
  return window.electron.ipcRenderer.invoke('save-file-by-path', imagePath, fileName)
}

export const saveFileByUrl = (url: string, fileName: string) => {
  Logger.info(logPrefix, 'saveFileByUrl', url, fileName)
  return window.electron.ipcRenderer.invoke('save-file-by-url', url, fileName)
}

export const saveFileByBase64 = (base64: string, fileName: string) => {
  Logger.info(logPrefix, 'saveFileByBase64', fileName)
  return window.electron.ipcRenderer.invoke('save-file-by-base64', base64, fileName)
}

export const readLocalImageBase64 = (path: string) => {
  Logger.info(logPrefix, 'readLocalImageBase64', path)
  return window.electron.ipcRenderer.invoke('read-local-image-base64', path)
}

export const clipboardWriteText = (text: string) => {
  Logger.info(logPrefix, 'clipboardWriteText', text)
  ElMessage.success(t('app.chat.body.message.copied'))
  return window.electron.ipcRenderer.invoke('clipboard-write-text', text)
}

export const clipboardWriteImage = (dataUrl: string) => {
  Logger.info(logPrefix, 'clipboardWriteImage', dataUrl)
  ElMessage.success(t('app.chat.body.message.copied'))
  return window.electron.ipcRenderer.invoke('clipboard-write-image', dataUrl)
}

export const clearCacheFiles = (ignoreFiles: string[]): Promise<number> => {
  Logger.info(logPrefix, 'clearCacheFiles', ignoreFiles)
  return window.electron.ipcRenderer.invoke('clear-cache-files', ignoreFiles)
}

export const getCacheFiles = (): Promise<{ name: string; data: string }[]> => {
  Logger.info(logPrefix, 'getCacheFiles')
  return window.electron.ipcRenderer.invoke('get-cache-files')
}

export const addCacheFiles = (cacheFiles: { name: string; data: string }[]): Promise<boolean> => {
  Logger.info(logPrefix, 'addCacheFiles', cacheFiles.length)
  return window.electron.ipcRenderer.invoke('add-cache-files', cacheFiles)
}

export const selectFile = (
  multiSelections?: boolean,
  extensions?: string[]
): Promise<[{ name: string; extname: string; path: string; stat: Stats }]> => {
  Logger.info(logPrefix, 'selectFile', multiSelections, extensions)
  return window.electron.ipcRenderer.invoke('select-file', multiSelections, extensions)
}

export const selectFileAndRead = (extensions?: string[]) => {
  Logger.info(logPrefix, 'selectFileAndRead', extensions)
  return window.electron.ipcRenderer.invoke('select-file-and-read', extensions)
}

export const openDevTools = () => {
  Logger.info(logPrefix, 'openDevTools')
  return window.electron.ipcRenderer.invoke('open-dev-tools')
}

export const executeJavaScript = (jsCode: string) => {
  Logger.info(logPrefix, 'executeJavaScript', jsCode)
  return window.electron.ipcRenderer.invoke('execute-js', jsCode)
}

export const onMainWindowFocus = (action: () => void) => {
  Logger.info(logPrefix, 'onMainWindowFocus')
  window.electron.ipcRenderer.on('main-window-focus', () => {
    action()
  })
}

export const onMainWindowBlur = (action: () => void) => {
  Logger.info(logPrefix, 'onMainWindowBlur')
  window.electron.ipcRenderer.on('main-window-blur', () => {
    action()
  })
}

export const langChainLoadFile = (filePath: string): Promise<string> => {
  Logger.info(logPrefix, 'langChainLoadFile', filePath)
  return window.electron.ipcRenderer.invoke('lang-chain-load-file', filePath)
}

export const showItemInFolder = (filePath: string) => {
  Logger.info(logPrefix, 'showItemInFolder', filePath)
  return window.electron.ipcRenderer.invoke('show-item-in-folder', filePath)
}

export const readWebBodyByUrl = (url: string) => {
  Logger.info(logPrefix, 'readWebBodyByUrl', url)
  return window.electron.ipcRenderer.invoke('read-web-body-by-url', url)
}

export const checkDesktopScreenshots = (): Promise<void> => {
  Logger.info(logPrefix, 'checkDesktopScreenshots')
  return window.electron.ipcRenderer.invoke('check-desktop-screenshots')
}

export const optionDesktopScreenshots = (): Promise<void> => {
  Logger.info(logPrefix, 'optionDesktopScreenshots')
  return window.electron.ipcRenderer.invoke('option-desktop-screenshots')
}

export const getDesktopScreenshots = (): Promise<DesktopScreenshot[]> => {
  Logger.info(logPrefix, 'getDesktopScreenshots')
  return window.electron.ipcRenderer.invoke('get-desktop-screenshots')
}

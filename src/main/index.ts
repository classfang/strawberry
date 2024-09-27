import { appConfig } from './config'
import { initLangChain } from './lang-chain'
import { initLogger } from './logger'
import { createWindow } from './main-window'
import { initScreenshots } from './screenshots'
import { initStore } from './store'
import { electronApp, is, optimizer, platform } from '@electron-toolkit/utils'
import {
  app,
  BrowserWindow,
  nativeImage,
  clipboard,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
  session
} from 'electron'
import fs from 'fs'
import { basename, extname, join } from 'path'
import * as vm from 'vm'

// 初始化仓库
const store = initStore()

// 初始化日志记录器
const logger = initLogger(appConfig.logsPath)

// 临时缓存目录
const creatCachePath = () => {
  try {
    fs.mkdirSync(appConfig.cachePath)
  } catch (e: any) {
    if (e.code != 'EEXIST') {
      logger.error('create cache path error：' + e)
    }
  }
}

// 主窗口
let mainWindow: BrowserWindow

// 应用准备就绪
app.whenReady().then(() => {
  // 设置user model
  electronApp.setAppUserModelId(appConfig.appUserModelId)

  // 在开发中默认使用 F12 打开或关闭 DevTools
  // 忽略生产环境中的 CommandOrControl + R。
  // 参考 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 创建缓存目录
  creatCachePath()

  // 创建窗口
  mainWindow = createWindow(store)

  // 初始化LangChain
  initLangChain()

  // 初始化屏幕截图
  initScreenshots()

  // 激活应用（点击dock栏图标、任务栏图标）
  app.on('activate', () => {
    if (!mainWindow.isMinimized()) {
      // 不是被最小化，直接显示主窗口
      mainWindow.show()
    }
  })

  // 加载vue devtools插件
  if (is.dev) {
    session.defaultSession
      .loadExtension(join(__dirname, '../../plugins/vue-devtools/6.6.3_0'))
      .then(() => {
        logger.info('vue-devtools load success')
      })
      .catch((e) => {
        logger.error('vue-devtools load error', e)
      })
  }
})

// 当所有窗口都关闭时退出，除了macOS
app.on('window-all-closed', () => {
  if (!platform.isMacOS) {
    app.quit()
  }
})

// 退出应用之前（手动关闭一些资源，防止出现意外关闭错误提示）
app.on('before-quit', async (e) => {
  e.preventDefault()
  // 销毁主窗口
  mainWindow.destroy()
  // 退出应用
  app.exit()
})

// 限制webview打开新窗口
app.on('web-contents-created', (_event, contents) => {
  if ('webview' === contents.getType()) {
    contents.setWindowOpenHandler((details) => {
      // 使用外部浏览器打开链接
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
  }
})

// 显示主窗口
ipcMain.handle('show-main-window', () => {
  if (!mainWindow.isMinimized()) {
    // 不是被最小化，直接显示主窗口
    mainWindow.show()
  } else {
    mainWindow.restore()
  }
})

// 切换主题
ipcMain.handle('set-theme-source', (_event, themeSource: 'system' | 'light' | 'dark') => {
  nativeTheme.themeSource = themeSource
})

// 获取系统类型
ipcMain.handle('process-platform', () => {
  return platform
})

// 获取缓存目录路径
ipcMain.on('get-cache-path', (event) => {
  event.returnValue = appConfig.cachePath
})

// 打开开发者控制台
ipcMain.handle('open-dev-tools', () => {
  mainWindow.webContents.openDevTools()
})

// 获取版本信息
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// 保存网络文件
ipcMain.handle('save-file-by-url', async (_event, url: string, fileName: string) => {
  creatCachePath()
  // 请求文件
  const fetchResp = await fetch(url)
  const blob = await fetchResp.blob()

  // 将blob写入文件
  const filePath = join(appConfig.cachePath, fileName)
  const fileStream = fs.createWriteStream(filePath)
  const buffer = Buffer.from(await blob.arrayBuffer())
  fileStream.write(buffer)
  fileStream.end()

  return fileName
})

// 保存base64文件
ipcMain.handle('save-file-by-base64', async (_event, base64: string, fileName: string) => {
  creatCachePath()

  // 去除base64数据前缀
  const commaIndex = base64.indexOf(',')
  if (commaIndex > -1) {
    base64 = base64.slice(commaIndex + 1)
  }
  const filePath = join(appConfig.cachePath, fileName)
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'), 'binary')

  return fileName
})

// 保存本地文件
ipcMain.handle('save-file-by-path', async (_event, path: string, fileName: string) => {
  creatCachePath()
  const filePath = join(appConfig.cachePath, fileName)
  fs.copyFileSync(path, filePath)

  return fileName
})

// 打开缓存目录
ipcMain.handle('open-cache-dir', () => {
  return shell.openPath(appConfig.cachePath)
})

// 打开日志目录
ipcMain.handle('open-log-dir', () => {
  return shell.openPath(appConfig.logsPath)
})

// 读取本地图片为base64字符串
ipcMain.handle('read-local-image-base64', (_event, path: string) => {
  // 读取图片文件
  const data = fs.readFileSync(path)
  // 将图片数据转换为Base64
  return Buffer.from(data).toString('base64')
})

// 设置代理地址
ipcMain.handle('set-proxy', (_event, proxyUrl: string) => {
  return mainWindow?.webContents.session.setProxy({ proxyRules: proxyUrl })
})

// 复制文本到剪贴板
ipcMain.handle('clipboard-write-text', (_event, text: string) => {
  clipboard.writeText(text)
})

// 复制图片到剪贴板
ipcMain.handle('clipboard-write-image', (_event, dataUrl: string) => {
  clipboard.writeImage(nativeImage.createFromDataURL(dataUrl))
})

// 获取缓存文件列表
ipcMain.handle('get-cache-files', () => {
  const files: string[] = fs.readdirSync(appConfig.cachePath)
  const cacheFiles: { name: string; data: string }[] = []
  if (!files || files.length === 0) {
    return cacheFiles
  }
  files.forEach((file) => {
    cacheFiles.push({
      name: file,
      data: fs.readFileSync(join(appConfig.cachePath, file)).toString('base64')
    })
  })
  return cacheFiles
})

// 添加缓存文件
ipcMain.handle('add-cache-files', (_event, cacheFiles: { name: string; data: string }[]) => {
  let resultFlag = false
  if (!cacheFiles || cacheFiles.length === 0) {
    return resultFlag
  }
  cacheFiles.forEach((file) => {
    try {
      fs.writeFileSync(join(appConfig.cachePath, file.name), Buffer.from(file.data, 'base64'))
      resultFlag = true
    } catch (e) {
      logger.error('add-cache-files error：' + e)
    }
  })
  return resultFlag
})

// 清理缓存文件
ipcMain.handle('clear-cache-files', (_event, ignoreFiles: string[]) => {
  let clearFileCount = 0
  const files: string[] = fs.readdirSync(appConfig.cachePath)
  if (!files || files.length === 0) {
    return clearFileCount
  }
  files.forEach((fileName) => {
    if (!ignoreFiles.includes(fileName)) {
      const filePath = join(appConfig.cachePath, fileName)
      fs.unlinkSync(filePath)
      clearFileCount++
    }
  })

  return clearFileCount
})

// 选择文件返回地址
ipcMain.handle('select-file', (_event, multiSelections = false, extensions = ['*']) => {
  const result = dialog.showOpenDialogSync(mainWindow, {
    properties: multiSelections ? ['openFile', 'multiSelections'] : ['openFile'],
    filters: [{ name: 'Select File', extensions }]
  })
  if (result && result.length > 0) {
    return result.map((path) => ({
      path,
      name: basename(path),
      extname: extname(path),
      stat: fs.statSync(path)
    }))
  }
  return []
})

// 选择文件并读取内容
ipcMain.handle('select-file-and-read', (_event, extensions = ['*']) => {
  const result = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Select File', extensions }]
  })
  if (result && result[0]) {
    return fs.readFileSync(result[0])
  }
  return null
})

// 运行JavaScript脚本
ipcMain.handle('execute-js', (_event, jsCode: string) => {
  const context = vm.createContext(Object.assign({ fetch: fetch }, global))
  return vm.runInContext(jsCode, context)
})

// 显示文件所在目录
ipcMain.handle('show-item-in-folder', (_event, filePath: string) => {
  return shell.showItemInFolder(filePath)
})

// 读取网页内容
ipcMain.handle('read-web-body-by-url', async (_event, url: string) => {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 300,
      height: 300,
      show: false
    })

    // 加载页面
    win.loadURL(url)

    // 监听页面加载完成事件
    win.webContents.on('did-finish-load', () => {
      // 使用 `webContents.executeJavaScript` 等待异步内容渲染完成
      win.webContents
        .executeJavaScript(`new Promise((resolve) => { resolve(document.body.innerText); });`)
        .then((content) => {
          resolve(content)
        })
        .catch(() => {
          reject()
        })
    })
  })
})

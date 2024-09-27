import { app } from 'electron'
import { join } from 'path'

export const appConfig = {
  appUserModelId: 'cn.junki.strawberry',
  logsPath: join(app.getPath('userData'), 'app_logs'),
  cachePath: join(app.getPath('userData'), 'app_cache')
}
export const mainWindowConfig = {
  minWidth: 960,
  minHeight: 620
}

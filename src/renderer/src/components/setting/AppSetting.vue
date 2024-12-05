<script setup lang="ts">
import {
  Brush,
  ChatLineSquare,
  CreditCard,
  Download,
  Folder,
  MessageBox,
  Microphone,
  Monitor,
  Moon,
  Sunny,
  Tools,
  Upload,
  Picture,
  ChatDotSquare,
  Link,
  Compass,
  Calendar,
  CoffeeCup,
  Coin
} from '@element-plus/icons-vue'
import buildInfo from '@renderer/assets/json/build-info.json'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import ArchivedDataSetting from '@renderer/components/setting/ArchivedDataSetting.vue'
import MemoryDataSetting from '@renderer/components/setting/MemoryDataSetting.vue'
import { AppConfig } from '@renderer/config/AppConfig'
import {
  OpenAIImageModelDallE3,
  OpenAIImageModels,
  OpenAIImageSizes,
  OpenAIModels,
  OpenAISpeechModels,
  OpenAISpeechVoices
} from '@renderer/config/OpenAIConfig'
import i18n from '@renderer/i18n'
import {
  clearCacheFiles,
  getAppVersion,
  getCacheFiles,
  onMainWindowFocus,
  openCacheDir,
  openDevTools,
  openLogDir,
  saveFileByBase64,
  selectFileAndRead,
  setProxy
} from '@renderer/service/ipc-service'
import { Logger } from '@renderer/service/logger-service'
import { useStore } from '@renderer/store/store'
import { exportTextFile } from '@renderer/utils/download-util'
import { openInBrowser } from '@renderer/utils/window-util'
import axios from 'axios'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, toRefs } from 'vue'

// 多语言
const { t } = i18n.global

// 仓库
const { appSettingStore, appStateStore, chatSessionStore, chatMemoryStore, aiCalendarStore } =
  useStore()

// 数据绑定
const data = reactive({
  badge: {
    appVersion: false
  },
  appVersion: '0.0.0'
})
const { badge, appVersion } = toRefs(data)

// 检查新版本
const checkAppVersion = () => {
  axios
    .get(AppConfig.versionCheckUrl)
    .then((response) => {
      const json = response.data
      if (json.name) {
        const appVersionArray = data.appVersion.split('.')
        const newVersionArray = json.name.split('.')
        for (let i = 0; i < newVersionArray.length; i++) {
          if (Number(newVersionArray[i]) > Number(appVersionArray[i])) {
            data.badge.appVersion = true
            break // 跳出循环，因为发现有新版本
          } else if (Number(newVersionArray[i]) < Number(appVersionArray[i])) {
            data.badge.appVersion = false
            break // 跳出循环，因为发现当前版本已经是最新的
          }
        }
      }
    })
    .catch((error) => {
      Logger.error('Error get the latest release:', error)
    })
}

// 清理缓存
const cleanCache = async () => {
  if (appStateStore.cleanCacheFlag) {
    return
  }
  appStateStore.cleanCacheFlag = true

  // 需要排除的文件
  const ignoreFiles: string[] = []
  chatSessionStore.sessions.forEach((session) =>
    session.messages.forEach((message) => {
      if (message.images && message.images.length > 0) {
        message.images.forEach((image) => ignoreFiles.push(image.saveName))
      }
      if (message.files && message.files.length > 0) {
        message.files.forEach((file) => ignoreFiles.push(file.saveName))
      }
    })
  )

  // 清理缓存文件
  const clearFileCount = await clearCacheFiles(ignoreFiles)

  ElMessage.success(
    t('app.setting.item.data.cleanFileCount').replace('_', clearFileCount.toString())
  )

  appStateStore.cleanCacheFlag = false
}

// 归档所有对话
const archivedAll = () => {
  ElMessageBox.confirm(
    t('app.setting.item.data.archivedAllConfirm'),
    t('app.setting.item.data.archivedAll'),
    {
      distinguishCancelAndClose: true,
      confirmButtonText: t('app.common.confirm'),
      cancelButtonText: t('app.common.cancel')
    }
  ).then(() => {
    chatSessionStore.archivedAll()
  })
}

// 导出设置数据
const exportSetting = () => {
  appStateStore.exportSettingFlag = true
  exportTextFile(
    `${dayjs().format('YYYYMMDDHHmmss')}.setting`,
    JSON.stringify({
      appSetting: appSettingStore.getStoreJson
    })
  )
  appStateStore.exportSettingFlag = false
}

// 导入设置数据
const importSetting = async () => {
  appStateStore.importSettingFlag = true

  const content = await selectFileAndRead(['setting'])
  const contentJson = JSON.parse(new TextDecoder().decode(content))
  if (contentJson.appSetting) {
    appSettingStore.setStoreFromJson(contentJson.appSetting)
  }

  ElMessage.success(t('app.setting.item.data.importSettingSuccess'))

  appStateStore.importSettingFlag = false
}

// 导出对话记录
const exportChat = async () => {
  appStateStore.exportChatFlag = true
  exportTextFile(
    `${dayjs().format('YYYYMMDDHHmmss')}.chat`,
    JSON.stringify({
      chatSession: chatSessionStore.getStoreJson,
      cacheFiles: await getCacheFiles()
    })
  )
  appStateStore.exportChatFlag = false
}

// 导入对话记录
const importChat = async () => {
  appStateStore.importChatFlag = true

  const content = await selectFileAndRead(['chat'])
  const contentJson = JSON.parse(new TextDecoder().decode(content))
  let importCount = 0
  if (contentJson.chatSession) {
    importCount = chatSessionStore.setStoreFromJson(contentJson.chatSession)
  }
  if (contentJson.cacheFiles) {
    for (const cacheFile of contentJson.cacheFiles) {
      if (cacheFile.data && cacheFile.name) {
        await saveFileByBase64(cacheFile.data, cacheFile.name)
      }
    }
  }

  ElMessage.success(t('app.setting.item.data.importChatCount').replace('_', String(importCount)))

  appStateStore.importChatFlag = false
}

// 清空对话记录
const clearChat = () => {
  ElMessageBox.confirm(
    t('app.setting.item.data.clearChatConfirm'),
    t('app.setting.item.data.clearChat'),
    {
      distinguishCancelAndClose: true,
      confirmButtonText: t('app.common.confirm'),
      cancelButtonText: t('app.common.cancel')
    }
  ).then(() => {
    chatSessionStore.clear()
  })
}

// 导出记忆数据
const exportMemory = async () => {
  appStateStore.exportMemoryFlag = true
  exportTextFile(
    `${dayjs().format('YYYYMMDDHHmmss')}.memory`,
    JSON.stringify({
      chatMemory: chatMemoryStore.getStoreJson
    })
  )
  appStateStore.exportMemoryFlag = false
}

// 导入记忆数据
const importMemory = async () => {
  appStateStore.importMemoryFlag = true

  const content = await selectFileAndRead(['memory'])
  const contentJson = JSON.parse(new TextDecoder().decode(content))
  let importCount = 0
  if (contentJson.chatMemory) {
    importCount = chatMemoryStore.setStoreFromJson(contentJson.chatMemory)
  }

  ElMessage.success(t('app.setting.item.data.importMemoryCount').replace('_', String(importCount)))

  appStateStore.importMemoryFlag = false
}

// 清空记忆数据
const clearMemory = () => {
  ElMessageBox.confirm(
    t('app.setting.item.data.clearMemoryConfirm'),
    t('app.setting.item.data.clearMemory'),
    {
      distinguishCancelAndClose: true,
      confirmButtonText: t('app.common.confirm'),
      cancelButtonText: t('app.common.cancel')
    }
  ).then(() => {
    chatMemoryStore.clear()
  })
}

// 导出日历数据
const exportCalendar = async () => {
  appStateStore.exportCalendarFlag = true
  exportTextFile(
    `${dayjs().format('YYYYMMDDHHmmss')}.calendar`,
    JSON.stringify({
      aiCalendar: aiCalendarStore.getStoreJson
    })
  )
  appStateStore.exportCalendarFlag = false
}

// 导入日历数据
const importCalendar = async () => {
  appStateStore.importCalendarFlag = true

  const content = await selectFileAndRead(['calendar'])
  const contentJson = JSON.parse(new TextDecoder().decode(content))
  let importCount = 0
  if (contentJson.aiCalendar) {
    importCount = aiCalendarStore.setStoreFromJson(contentJson.aiCalendar)
  }

  ElMessage.success(
    t('app.setting.item.data.importCalendarCount').replace('_', String(importCount))
  )

  appStateStore.importCalendarFlag = false
}

// 清空日历数据
const clearCalendar = () => {
  ElMessageBox.confirm(
    t('app.setting.item.data.clearCalendarConfirm'),
    t('app.setting.item.data.clearCalendar'),
    {
      distinguishCancelAndClose: true,
      confirmButtonText: t('app.common.confirm'),
      cancelButtonText: t('app.common.cancel')
    }
  ).then(() => {
    aiCalendarStore.clear()
  })
}

// 打开设置页
const openDialog = () => {
  if (appStateStore.chatLoadingFlag) {
    return
  }
  appStateStore.appSettingDialogVisible = true
}

// 暴露方法
defineExpose({
  openDialog
})

onMounted(() => {
  // 获取应用版本号
  getAppVersion().then((v) => {
    data.appVersion = v
  })

  // 每次获得焦点检查最新版本，限制一小时内不重复检查
  onMainWindowFocus(() => {
    if (new Date().getTime() - appSettingStore.app.lastCheckVersionTime > 1000 * 60 * 60) {
      checkAppVersion()
      appSettingStore.app.lastCheckVersionTime = new Date().getTime()
    }
  })
})
</script>

<template>
  <div class="app-setting">
    <el-tooltip :content="$t('app.setting.title')">
      <el-badge is-dot :hidden="!badge.appVersion">
        <AppIcon name="setting" class="setting-icon" @click="openDialog()" />
      </el-badge>
    </el-tooltip>

    <el-dialog
      v-model="appStateStore.appSettingDialogVisible"
      :title="$t('app.setting.title')"
      width="700"
      align-center
    >
      <div class="dialog-body">
        <el-tabs tab-position="left">
          <!-- 外观 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><Brush /></el-icon>
                <span>{{ $t('app.setting.appearance') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- 主题 -->
              <el-form-item :label="$t('app.setting.item.theme.label')">
                <el-radio-group v-model="appSettingStore.app.themeModel">
                  <el-radio-button :value="0">
                    <el-space :size="5">
                      <Monitor class="setting-item-icon" />
                      <div>{{ $t('app.setting.item.theme.auto') }}</div>
                    </el-space>
                  </el-radio-button>
                  <el-radio-button :value="1">
                    <el-space :size="5">
                      <Sunny class="setting-item-icon" />
                      <div>{{ $t('app.setting.item.theme.light') }}</div>
                    </el-space>
                  </el-radio-button>
                  <el-radio-button :value="2">
                    <el-space :size="5">
                      <Moon class="setting-item-icon" />
                      <div>{{ $t('app.setting.item.theme.dark') }}</div>
                    </el-space>
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <!-- 语言 -->
              <el-form-item :label="$t('app.setting.item.language.label')">
                <el-radio-group v-model="appSettingStore.app.locale">
                  <el-radio-button :label="$t('app.setting.item.language.zhCN')" value="zh_CN" />
                  <el-radio-button :label="$t('app.setting.item.language.enUS')" value="en_US" />
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- OpenAI -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><CreditCard /></el-icon>
                <span>{{ $t('app.setting.openai') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- Guide URL -->
              <el-form-item :label="$t('app.setting.item.openai.guide.label')">
                <el-button
                  link
                  type="primary"
                  @click="openInBrowser($t('app.setting.item.openai.guide.url'))"
                >
                  {{ $t('app.setting.item.openai.guide.url') }}
                </el-button>
              </el-form-item>

              <!-- Base URL -->
              <el-form-item :label="$t('app.setting.item.openai.baseUrl')">
                <el-input v-model="appSettingStore.openAI.baseUrl" />
              </el-form-item>

              <!-- API Key -->
              <el-form-item :label="$t('app.setting.item.openai.apiKey')">
                <el-input v-model="appSettingStore.openAI.apiKey" show-password type="password" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 对话 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><ChatLineSquare /></el-icon>
                <span>{{ $t('app.setting.chat') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- Model -->
              <el-form-item :label="$t('app.setting.item.chat.model')">
                <el-select
                  v-model="appSettingStore.openAI.chatOption.model"
                  allow-create
                  filterable
                >
                  <el-option-group
                    v-for="group in OpenAIModels"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="item in group.options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-option-group>
                </el-select>
              </el-form-item>

              <!-- Temperature -->
              <el-form-item :label="$t('app.setting.item.chat.temperature')">
                <el-tooltip
                  :content="$t('app.setting.item.chat.explain.temperature')"
                  placement="right"
                >
                  <el-input-number
                    v-model="appSettingStore.openAI.chatOption.temperature"
                    :min="0"
                    :max="1"
                    :step="0.1"
                  />
                </el-tooltip>
              </el-form-item>

              <!-- Top P -->
              <el-form-item :label="$t('app.setting.item.chat.topP')">
                <el-tooltip :content="$t('app.setting.item.chat.explain.topP')" placement="right">
                  <el-input-number
                    v-model="appSettingStore.openAI.chatOption.topP"
                    :min="0"
                    :max="1"
                    :step="0.1"
                  />
                </el-tooltip>
              </el-form-item>

              <!-- Max Tokens -->
              <el-form-item :label="$t('app.setting.item.chat.maxCompletionTokens')">
                <el-tooltip
                  :content="$t('app.setting.item.chat.explain.maxCompletionTokens')"
                  placement="right"
                >
                  <el-input-number
                    v-model="appSettingStore.openAI.chatOption.maxCompletionTokens"
                    :min="1024"
                    :max="1024000"
                    :step="1"
                  />
                </el-tooltip>
              </el-form-item>

              <!-- Presence Penalty -->
              <el-form-item :label="$t('app.setting.item.chat.presencePenalty')">
                <el-tooltip
                  :content="$t('app.setting.item.chat.explain.presencePenalty')"
                  placement="right"
                >
                  <el-input-number
                    v-model="appSettingStore.openAI.chatOption.presencePenalty"
                    :min="-2"
                    :max="2"
                    :step="0.1"
                  />
                </el-tooltip>
              </el-form-item>

              <!-- Frequency Penalty -->
              <el-form-item :label="$t('app.setting.item.chat.frequencyPenalty')">
                <el-tooltip
                  :content="$t('app.setting.item.chat.explain.frequencyPenalty')"
                  placement="right"
                >
                  <el-input-number
                    v-model="appSettingStore.openAI.chatOption.frequencyPenalty"
                    :min="-2"
                    :max="2"
                    :step="0.1"
                  />
                </el-tooltip>
              </el-form-item>

              <!-- Context Size -->
              <el-form-item :label="$t('app.setting.item.chat.contextSize')">
                <el-tooltip
                  :content="$t('app.setting.item.chat.explain.contextSize')"
                  placement="right"
                >
                  <el-input-number
                    v-model="appSettingStore.openAI.chatOption.contextSize"
                    :min="0"
                    :max="100"
                    :step="1"
                  />
                </el-tooltip>
              </el-form-item>

              <!-- Auto Generate Title -->
              <el-form-item :label="$t('app.setting.item.chat.autoGenerateSessionName')">
                <el-tooltip
                  :content="$t('app.setting.item.chat.explain.autoGenerateSessionName')"
                  placement="right"
                >
                  <el-switch v-model="appSettingStore.openAI.chatOption.autoGenerateSessionName" />
                </el-tooltip>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 发音 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><Microphone /></el-icon>
                <span>{{ $t('app.setting.speech') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- Model -->
              <el-form-item :label="$t('app.setting.item.speech.model')">
                <el-select
                  v-model="appSettingStore.openAI.speechOption.model"
                  allow-create
                  filterable
                >
                  <el-option-group
                    v-for="group in OpenAISpeechModels"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="item in group.options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-option-group>
                </el-select>
              </el-form-item>

              <!-- voice -->
              <el-form-item :label="$t('app.setting.item.speech.voice')">
                <el-select
                  v-model="appSettingStore.openAI.speechOption.voice"
                  allow-create
                  filterable
                >
                  <el-option
                    v-for="item in OpenAISpeechVoices"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- speed -->
              <el-form-item :label="$t('app.setting.item.speech.speed')">
                <el-input-number
                  v-model="appSettingStore.openAI.speechOption.speed"
                  :min="0.25"
                  :max="4.0"
                  :step="0.01"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 文生图 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><Picture /></el-icon>
                <span>{{ $t('app.setting.textToImage') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- Enabled -->
              <el-form-item :label="$t('app.setting.item.textToImage.enabled')">
                <el-tooltip
                  :content="$t('app.setting.item.textToImage.explain.enabled')"
                  placement="right"
                >
                  <el-switch v-model="appSettingStore.openAI.textToImageOption.enabled" />
                </el-tooltip>
              </el-form-item>
              <!-- Model -->
              <el-form-item :label="$t('app.setting.item.textToImage.model')">
                <el-select
                  v-model="appSettingStore.openAI.textToImageOption.model"
                  allow-create
                  filterable
                >
                  <el-option
                    v-for="item in OpenAIImageModels"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <!-- n -->
              <el-form-item :label="$t('app.setting.item.textToImage.n')">
                <el-input-number
                  v-model="appSettingStore.openAI.textToImageOption.n"
                  :min="1"
                  :max="
                    appSettingStore.openAI.textToImageOption.model === OpenAIImageModelDallE3
                      ? 1
                      : 4
                  "
                  :step="1"
                />
              </el-form-item>
              <!-- quality -->
              <el-form-item
                v-if="appSettingStore.openAI.textToImageOption.model === OpenAIImageModelDallE3"
                :label="$t('app.setting.item.textToImage.quality')"
              >
                <el-select v-model="appSettingStore.openAI.textToImageOption.quality">
                  <el-option label="standard" value="standard" />
                  <el-option label="hd" value="hd" />
                </el-select>
              </el-form-item>
              <!-- size -->
              <el-form-item :label="$t('app.setting.item.textToImage.size')">
                <el-select v-model="appSettingStore.openAI.textToImageOption.size">
                  <el-option
                    v-for="item in OpenAIImageSizes[appSettingStore.openAI.textToImageOption.model]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <!-- style -->
              <el-form-item
                v-if="appSettingStore.openAI.textToImageOption.model === OpenAIImageModelDallE3"
                :label="$t('app.setting.item.textToImage.style')"
              >
                <el-select v-model="appSettingStore.openAI.textToImageOption.style">
                  <el-option label="vivid" value="vivid" />
                  <el-option label="natural" value="natural" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 记忆 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><ChatDotSquare /></el-icon>
                <span>{{ $t('app.setting.memory') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- Enabled -->
              <el-form-item :label="$t('app.setting.item.memory.enabled')">
                <el-tooltip
                  :content="$t('app.setting.item.memory.explain.enabled')"
                  placement="right"
                >
                  <el-switch v-model="appSettingStore.memoryOption.enabled" />
                </el-tooltip>
              </el-form-item>
              <!-- Guide -->
              <el-form-item>
                <div class="setting-item-guide">{{ $t('app.setting.item.memory.guide') }}</div>
              </el-form-item>
              <!-- Manage -->
              <el-form-item>
                <MemoryDataSetting />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 互联网搜索 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><Compass /></el-icon>
                <span>{{ $t('app.setting.internetSearch') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- Enabled -->
              <el-form-item :label="$t('app.setting.item.internetSearch.enabled')">
                <el-tooltip
                  :content="$t('app.setting.item.internetSearch.explain.enabled')"
                  placement="right"
                >
                  <el-switch v-model="appSettingStore.internetSearchOption.enabled" />
                </el-tooltip>
              </el-form-item>

              <!-- Guide URL -->
              <el-form-item :label="$t('app.setting.item.internetSearch.google.guide.label')">
                <el-button
                  link
                  type="primary"
                  @click="openInBrowser($t('app.setting.item.internetSearch.google.guide.url'))"
                >
                  {{ $t('app.setting.item.internetSearch.google.guide.url') }}
                </el-button>
              </el-form-item>

              <!-- Base URL -->
              <el-form-item :label="$t('app.setting.item.internetSearch.google.baseUrl')">
                <el-input v-model="appSettingStore.internetSearchOption.google.baseUrl" />
              </el-form-item>

              <!-- key -->
              <el-form-item :label="$t('app.setting.item.internetSearch.google.key')">
                <el-input
                  v-model="appSettingStore.internetSearchOption.google.key"
                  show-password
                  type="password"
                />
              </el-form-item>

              <!-- cx -->
              <el-form-item :label="$t('app.setting.item.internetSearch.google.cx')">
                <el-input
                  v-model="appSettingStore.internetSearchOption.google.cx"
                  show-password
                  type="password"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 日历 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><Calendar /></el-icon>
                <span>{{ $t('app.setting.calendar') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- Enabled -->
              <el-form-item :label="$t('app.setting.item.calendar.queryEnabled')">
                <el-tooltip
                  :content="$t('app.setting.item.calendar.explain.enabled')"
                  placement="right"
                >
                  <el-switch v-model="appSettingStore.calendarOption.queryEnabled" />
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('app.setting.item.calendar.addEnabled')">
                <el-tooltip
                  :content="$t('app.setting.item.calendar.explain.enabled')"
                  placement="right"
                >
                  <el-switch v-model="appSettingStore.calendarOption.addEnabled" />
                </el-tooltip>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 网络 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><Link /></el-icon>
                <span>{{ $t('app.setting.network') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- 网络代理 -->
              <el-form-item :label="$t('app.setting.item.proxy.label')">
                <el-input
                  v-model="appSettingStore.app.proxy"
                  @change="setProxy(appSettingStore.app.proxy)"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 数据 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><Coin /></el-icon>
                <span>{{ $t('app.setting.data') }}</span>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- 缓存目录 -->
              <el-form-item :label="$t('app.setting.item.data.cache')">
                <el-space wrap>
                  <el-button :icon="Folder" @click="openCacheDir()">
                    {{ $t('app.setting.item.data.openCacheDir') }}
                  </el-button>
                  <el-button
                    :icon="Brush"
                    :loading="appStateStore.cleanCacheFlag"
                    @click="cleanCache()"
                  >
                    {{ $t('app.setting.item.data.cleanCache') }}
                  </el-button>
                </el-space>
              </el-form-item>

              <!-- 归档 -->
              <el-form-item :label="$t('app.setting.item.data.archived')">
                <el-space wrap>
                  <el-button :icon="MessageBox" @click="archivedAll()">
                    {{ $t('app.setting.item.data.archivedAll') }}
                  </el-button>
                  <ArchivedDataSetting />
                </el-space>
              </el-form-item>

              <!-- 设置数据 -->
              <el-form-item :label="$t('app.setting.item.data.setting')">
                <el-space wrap>
                  <el-button
                    :icon="Download"
                    :loading="appStateStore.exportSettingFlag"
                    @click="exportSetting()"
                  >
                    {{ $t('app.setting.item.data.exportSetting') }}
                  </el-button>
                  <el-button
                    :icon="Upload"
                    :loading="appStateStore.importSettingFlag"
                    @click="importSetting()"
                  >
                    {{ $t('app.setting.item.data.importSetting') }}
                  </el-button>
                </el-space>
              </el-form-item>

              <!-- 对话数据 -->
              <el-form-item :label="$t('app.setting.item.data.chat')">
                <el-space wrap>
                  <el-button
                    :icon="Download"
                    :loading="appStateStore.exportChatFlag"
                    @click="exportChat()"
                  >
                    {{ $t('app.setting.item.data.exportChat') }}
                  </el-button>
                  <el-button
                    :icon="Upload"
                    :loading="appStateStore.importChatFlag"
                    @click="importChat()"
                  >
                    {{ $t('app.setting.item.data.importChat') }}
                  </el-button>
                  <el-button :icon="Brush" @click="clearChat()">
                    {{ $t('app.setting.item.data.clearChat') }}
                  </el-button>
                </el-space>
              </el-form-item>

              <!-- 记忆数据 -->
              <el-form-item :label="$t('app.setting.item.data.memory')">
                <el-space wrap>
                  <el-button
                    :icon="Download"
                    :loading="appStateStore.exportMemoryFlag"
                    @click="exportMemory()"
                  >
                    {{ $t('app.setting.item.data.exportMemory') }}
                  </el-button>
                  <el-button
                    :icon="Upload"
                    :loading="appStateStore.importMemoryFlag"
                    @click="importMemory()"
                  >
                    {{ $t('app.setting.item.data.importMemory') }}
                  </el-button>
                  <el-button :icon="Brush" @click="clearMemory()">
                    {{ $t('app.setting.item.data.clearMemory') }}
                  </el-button>
                </el-space>
              </el-form-item>

              <!-- 日历数据 -->
              <el-form-item :label="$t('app.setting.item.data.calendar')">
                <el-space wrap>
                  <el-button
                    :icon="Download"
                    :loading="appStateStore.exportCalendarFlag"
                    @click="exportCalendar()"
                  >
                    {{ $t('app.setting.item.data.exportCalendar') }}
                  </el-button>
                  <el-button
                    :icon="Upload"
                    :loading="appStateStore.importCalendarFlag"
                    @click="importCalendar()"
                  >
                    {{ $t('app.setting.item.data.importCalendar') }}
                  </el-button>
                  <el-button :icon="Brush" @click="clearCalendar()">
                    {{ $t('app.setting.item.data.clearCalendar') }}
                  </el-button>
                </el-space>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 关于 -->
          <el-tab-pane>
            <template #label>
              <div class="setting-item-label">
                <el-icon><CoffeeCup /></el-icon>
                <el-badge is-dot :hidden="!badge.appVersion">
                  <span>{{ $t('app.setting.about') }}</span>
                </el-badge>
              </div>
            </template>
            <el-form label-width="auto" label-position="left">
              <!-- 应用版本 -->
              <el-form-item :label="$t('app.setting.item.about.appVersion')">
                <el-space :size="15">
                  <div>v{{ appVersion }}</div>
                  <el-badge is-dot :hidden="!badge.appVersion">
                    <el-button :icon="Download" @click="openInBrowser(AppConfig.gitUrl)">
                      {{ $t('app.setting.item.about.appDownload') }}
                    </el-button>
                  </el-badge>
                </el-space>
              </el-form-item>

              <!-- 构建时间 -->
              <el-form-item :label="$t('app.setting.item.about.buildTime')">
                <div>{{ dayjs(buildInfo.buildTime).format('YYYY-MM-DD HH:mm:ss.SSS') }}</div>
              </el-form-item>

              <!-- 开发者工具 -->
              <el-form-item :label="$t('app.setting.item.about.devTools')">
                <el-space>
                  <el-button :icon="Tools" @click="openDevTools()">
                    {{ $t('app.setting.item.about.openDevTools') }}
                  </el-button>
                  <el-button :icon="Folder" @click="openLogDir()">
                    {{ $t('app.setting.item.about.openLogDir') }}
                  </el-button>
                </el-space>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-setting {
  height: $app-icon-size-base;
  width: $app-icon-size-base;

  .setting-icon {
    height: $app-icon-size-base;
    width: $app-icon-size-base;
    flex-shrink: 0;
    color: var(--el-text-color-regular);
    transition: color $app-transition-base;
    cursor: pointer;
    outline: none;

    &:hover {
      color: var(--el-text-color-primary);
    }
  }

  .dialog-body {
    height: $app-dialog-height;

    :deep(.el-tabs) {
      height: 100%;

      .el-tabs--right,
      .el-tabs__content,
      .el-tabs--left,
      .el-tabs__content,
      .el-tab-pane {
        height: 100%;
      }

      .el-tabs__item {
        padding-left: 0;
      }
    }

    :deep(.el-tabs__content) {
      box-sizing: border-box;
      padding: $app-padding-extra-small $app-padding-small;
    }

    .setting-item-label {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: $app-padding-small;
    }

    .setting-item-icon {
      height: $app-icon-size-small;
      width: $app-icon-size-small;
    }

    .setting-item-guide {
      white-space: pre-wrap;
      line-break: anywhere;
      line-height: $app-line-height-base;
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-small);
    }
  }
}
</style>

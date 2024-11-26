<script setup lang="ts">
import { CircleCloseFilled, Document, Link, Monitor, Promotion } from '@element-plus/icons-vue'
import ChatBodyScreenshotList from '@renderer/components/chat/body/ChatBodyScreenshotList.vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import FileIcon from '@renderer/components/icon/FileIcon.vue'
import { AppConfig } from '@renderer/config/AppConfig'
import {
  checkDesktopScreenshots,
  langChainLoadFile,
  optionDesktopScreenshots,
  readLocalImageBase64,
  readWebBodyByUrl,
  saveFileByBase64,
  saveFileByPath,
  selectFile,
  showItemInFolder,
  showMainWindow
} from '@renderer/service/ipc-service'
import { Logger } from '@renderer/service/logger-service'
import { openaiChat } from '@renderer/service/openai-service'
import { getToolsDefine, ToolEnum, toolsUse } from '@renderer/service/tool-service'
import { useStore } from '@renderer/store/store'
import { fileToBase64 } from '@renderer/utils/base64-util'
import { formatFileSize, getFileExtension } from '@renderer/utils/file-util'
import { generateUUID } from '@renderer/utils/id-util'
import { join } from '@renderer/utils/path-util'
import { notification, openInBrowser } from '@renderer/utils/window-util'
import { Action, ElMessage, ElMessageBox, MessageBoxState } from 'element-plus'
import OpenAI from 'openai'
import { computed, nextTick, onMounted, reactive, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

// i18n
const { t } = useI18n()

// 仓库
const { chatSessionStore, appSettingStore, appStateStore, chatMemoryStore, aiCalendarStore } =
  useStore()

// 数据绑定
const data = reactive({
  question: '',
  imageList: [] as ChatMessageFile[],
  fileList: [] as ChatMessageFile[],
  linkList: [] as ChatMessageLink[],
  screenshotDialogVisible: false
})
const { question, imageList, fileList, linkList, screenshotDialogVisible } = toRefs(data)

// 计算提及列表
const mentionOptions = computed(() =>
  Object.values(ToolEnum).map((toolName) => {
    return {
      label: t(`app.chat.body.input.mention.${toolName}`),
      value: t(`app.chat.body.input.mention.${toolName}`),
      toolName: toolName
    }
  })
)

// 定义事件
const emits = defineEmits(['send-question', 'update-message'])

// ref
const questionTextareaRef = ref()

// 阻断控制
let abortCtr = new AbortController()

// 文本域获得焦点
const inputTextareaFocus = () => {
  nextTick(() => {
    questionTextareaRef.value?.input.focus()
  })
}

// 发送提问
const sendQuestion = async (event?: KeyboardEvent, regenerateFlag?: boolean) => {
  // 加载中、内容为空、输入法回车，不发送消息
  if (!regenerateFlag) {
    if (
      appStateStore.chatLoadingFlag ||
      appStateStore.uploadFlag ||
      !data.question.trim() ||
      event?.isComposing ||
      questionTextareaRef.value?.dropdownVisible
    ) {
      event?.preventDefault()
      return
    } else if (event?.shiftKey) {
      return
    } else {
      event?.preventDefault()
    }
  }

  // 加载中
  appStateStore.chatLoadingFlag = true

  emits('send-question')

  // 是否无标题
  const noSessionNameFlag = chatSessionStore.getActiveSession!.name.trim().length === 0

  // 提问记录
  if (!regenerateFlag) {
    chatSessionStore.pushMessage({
      type: 'chat',
      role: 'user',
      content: data.question.trim(),
      images: data.imageList,
      files: data.fileList,
      links: data.linkList
    })
    data.question = ''
    data.imageList = []
    data.fileList = []
    data.linkList = []
    emits('update-message')
  }

  // 阻断器
  const abortCtrSignal = abortCtr.signal

  // 开始回答
  if (!regenerateFlag) {
    streamAnswer()
  } else {
    appStateStore.chatAnswerFlag = true
  }

  // 工具名称列表
  const toolNameList = getToolNameList(chatSessionStore.getActiveSession!.messages.at(-2)?.content)

  // 转换消息列表
  const sendMessages = await convertMessages(
    chatSessionStore.getActiveSession!.messages,
    chatSessionStore.getActiveSession!.chatOption.contextSize,
    1
  )

  // 判断配置是否正确
  if (!appSettingStore.openAI.baseUrl) {
    errorAnswer(t('app.chat.body.input.pleaseConfigure') + t('app.setting.item.openai.baseUrl'))
    return
  }
  if (!appSettingStore.openAI.apiKey) {
    errorAnswer(t('app.chat.body.input.pleaseConfigure') + t('app.setting.item.openai.apiKey'))
    return
  }
  if (toolNameList.includes(ToolEnum.INTERNET_SEARCH)) {
    if (!appSettingStore.internetSearchOption.google.baseUrl) {
      errorAnswer(
        t('app.chat.body.input.pleaseConfigure') +
          t('app.setting.item.internetSearch.google.baseUrl')
      )
      return
    }
    if (!appSettingStore.internetSearchOption.google.key) {
      errorAnswer(
        t('app.chat.body.input.pleaseConfigure') + t('app.setting.item.internetSearch.google.key')
      )
      return
    }
    if (!appSettingStore.internetSearchOption.google.cx) {
      errorAnswer(
        t('app.chat.body.input.pleaseConfigure') + t('app.setting.item.internetSearch.google.cx')
      )
      return
    }
  }

  // 工具调用参数记录
  let toolCallId = ''
  let functionName = ''
  let functionArguments = ''

  // OpenAI对话
  await openaiChat({
    baseURL: appSettingStore.openAI.baseUrl,
    apiKey: appSettingStore.openAI.apiKey,
    params: {
      stream: true,
      stream_options: {
        include_usage: true
      },
      messages: sendMessages,
      tools: toolNameList.length > 0 ? getToolsDefine(toolNameList) : undefined,
      model: chatSessionStore.getActiveSession!.chatOption.model,
      max_tokens: chatSessionStore.getActiveSession!.chatOption.maxTokens,
      temperature: chatSessionStore.getActiveSession!.chatOption.temperature,
      top_p: chatSessionStore.getActiveSession!.chatOption.topP,
      presence_penalty: chatSessionStore.getActiveSession!.chatOption.presencePenalty,
      frequency_penalty: chatSessionStore.getActiveSession!.chatOption.frequencyPenalty
    },
    abortCtrSignal: abortCtrSignal,
    answer: (chunk: OpenAI.ChatCompletionChunk) => {
      // 是否是tool_calls（当前只获取第一个工具调用）
      if (
        toolNameList.length > 0 &&
        chunk.choices[0]?.delta.tool_calls &&
        chunk.choices[0].delta.tool_calls[0]
      ) {
        if (chunk.choices[0]?.delta.tool_calls[0].id) {
          toolCallId = chunk.choices[0].delta.tool_calls[0].id
        }
        if (chunk.choices[0]?.delta.tool_calls[0].function?.name) {
          functionName = chunk.choices[0].delta.tool_calls[0].function?.name
        }
        if (chunk.choices[0]?.delta.tool_calls[0].function?.arguments) {
          functionArguments += chunk.choices[0].delta.tool_calls[0].function?.arguments
        }
      } else if (chunk.choices[0]?.delta.content) {
        streamAnswer(chunk.choices[0].delta.content)
      }

      // 用量统计
      usageStatistic(chunk.usage!)

      emits('update-message')
    },
    error: (error: any) => {
      errorAnswer(error.message)
    },
    end: async () => {
      if (toolCallId && functionName && functionArguments) {
        try {
          // 修改当前运行工具状态
          appStateStore.currentToolName = functionName

          // 执行工具
          let toolResult = await toolsUse(
            functionName,
            functionArguments,
            abortCtrSignal,
            chatSessionStore.getActiveSession!,
            appSettingStore
          )

          // 针对不同的插件进行结果处理
          if (ToolEnum.CALENDAR_NOTE_QUERY === functionName) {
            // 根据时间范围查询日历内容
            toolResult = JSON.stringify(
              Object.keys(aiCalendarStore.dayNotes)
                .filter(
                  (key) =>
                    key >= JSON.parse(toolResult).startTime && key <= JSON.parse(toolResult).endTime
                )
                .map((key) => ({
                  time: key,
                  content: aiCalendarStore.dayNotes[key]
                }))
            )
            // 继续调用对话能力
            await functionCall({
              sendMessages,
              functionName,
              functionArguments,
              toolCallId,
              toolResult,
              abortCtrSignal,
              noSessionNameFlag,
              regenerateFlag
            })
          } else if (ToolEnum.CALENDAR_NOTE_ADD === functionName) {
            // 保存日历内容
            aiCalendarStore.appendNote(JSON.parse(toolResult))
            // 日历保存结果回答
            streamAnswer(
              t('app.chat.body.message.calendarAddResult').replace(
                '_',
                JSON.parse(toolResult).content
              )
            )
            // 结束回答
            finishAnswer(noSessionNameFlag, regenerateFlag)
          } else if (ToolEnum.MEMORY === functionName) {
            // 保存记忆内容
            chatMemoryStore.add(toolResult)
            // 记忆结果回答
            streamAnswer(t('app.chat.body.message.memoryResult').replace('_', toolResult))
            // 结束回答
            finishAnswer(noSessionNameFlag, regenerateFlag)
          } else if (ToolEnum.TEXT_TO_IMAGE === functionName) {
            // 图片生成回答
            streamAnswer(t('app.chat.body.message.textToImageContent'), JSON.parse(toolResult))
            // 结束回答
            finishAnswer(noSessionNameFlag, regenerateFlag)
          } else if (ToolEnum.INTERNET_SEARCH === functionName) {
            // 记录搜索结果
            streamAnswer('', undefined, JSON.parse(toolResult))
            // 继续调用对话能力
            await functionCall({
              sendMessages,
              functionName,
              functionArguments,
              toolCallId,
              toolResult,
              abortCtrSignal,
              noSessionNameFlag,
              regenerateFlag
            })
          }

          // 修改当前运行工具状态
          appStateStore.currentToolName = null
        } catch (error: any) {
          errorAnswer(error.message)
        }
      } else {
        // 结束回答
        finishAnswer(noSessionNameFlag, regenerateFlag)
      }
    }
  })
}

// 工具调用后再次调用大模型
const functionCall = async (params: {
  sendMessages: OpenAI.ChatCompletionMessageParam[]
  functionName: string
  functionArguments: string
  toolCallId: string
  toolResult: string
  abortCtrSignal: AbortSignal
  noSessionNameFlag: boolean
  regenerateFlag?: boolean
}) => {
  const {
    sendMessages,
    functionName,
    functionArguments,
    toolCallId,
    toolResult,
    abortCtrSignal,
    noSessionNameFlag,
    regenerateFlag
  } = params
  sendMessages.push({
    role: 'assistant',
    content: null,
    tool_calls: [
      {
        id: toolCallId,
        type: 'function',
        function: { name: functionName, arguments: functionArguments }
      }
    ]
  })
  sendMessages.push({
    role: 'tool',
    tool_call_id: toolCallId,
    content: toolResult
  })
  await openaiChat({
    baseURL: appSettingStore.openAI.baseUrl,
    apiKey: appSettingStore.openAI.apiKey,
    params: {
      stream: true,
      stream_options: {
        include_usage: true
      },
      messages: sendMessages,
      model: chatSessionStore.getActiveSession!.chatOption.model,
      max_tokens: chatSessionStore.getActiveSession!.chatOption.maxTokens,
      temperature: chatSessionStore.getActiveSession!.chatOption.temperature,
      top_p: chatSessionStore.getActiveSession!.chatOption.topP,
      presence_penalty: chatSessionStore.getActiveSession!.chatOption.presencePenalty,
      frequency_penalty: chatSessionStore.getActiveSession!.chatOption.frequencyPenalty
    },
    abortCtrSignal: abortCtrSignal,
    answer: (chunk: OpenAI.ChatCompletionChunk) => {
      streamAnswer(chunk.choices[0]?.delta.content ?? '')

      // 用量统计
      usageStatistic(chunk.usage!)

      emits('update-message')
    },
    error: (error: any) => {
      errorAnswer(error.message)
    },
    end: () => {
      // 结束回答
      finishAnswer(noSessionNameFlag, regenerateFlag)
    }
  })
}

// 获取当前使用的工具列表
const getToolNameList = (question: string | undefined) => {
  if (!question) {
    return []
  }

  const toolNameList: Set<ToolEnum> = new Set<ToolEnum>()
  if (question.startsWith('@')) {
    // 只获取第一个提及
    const mentionLabel = question.substring(question.indexOf('@') + 1, question.indexOf(' '))
    if (mentionLabel) {
      const mention = mentionOptions.value.find((m) => m.label === mentionLabel)
      if (mention) {
        toolNameList.add(mention.toolName)
      }
    }
  }
  if (chatSessionStore.getActiveSession!.calendarOption?.queryEnabled) {
    toolNameList.add(ToolEnum.CALENDAR_NOTE_QUERY)
  }
  if (chatSessionStore.getActiveSession!.calendarOption?.addEnabled) {
    toolNameList.add(ToolEnum.CALENDAR_NOTE_ADD)
  }
  if (chatSessionStore.getActiveSession!.memoryOption?.enabled) {
    toolNameList.add(ToolEnum.MEMORY)
  }
  if (chatSessionStore.getActiveSession!.textToImageOption?.enabled) {
    toolNameList.add(ToolEnum.TEXT_TO_IMAGE)
  }
  if (chatSessionStore.getActiveSession!.internetSearchOption?.enabled) {
    toolNameList.add(ToolEnum.INTERNET_SEARCH)
  }
  return [...toolNameList]
}

// 转换消息列表
const convertMessages = async (
  messages: ChatMessage[],
  contextSize?: number,
  ignoreSize = 0,
  ignoreFile = false,
  ignoreLink = false,
  ignoreMemory = false
): Promise<OpenAI.ChatCompletionMessageParam[]> => {
  // 跳过 ignoreSize 条记录，截取最后 contextSize 条记录，
  let chatMessages = messages.slice(
    contextSize ? -(contextSize + 1 + ignoreSize) : 0,
    messages.length - ignoreSize
  )

  // 截取最后一个断开上下文位置之后的记录
  chatMessages = chatMessages.slice(chatMessages.findLastIndex((m) => m.type === 'divider') + 1)

  // 过滤出所有对话记录
  chatMessages = chatMessages.filter((m) => m.type === 'chat')

  const convertMessageResult = [] as OpenAI.ChatCompletionMessageParam[]
  for (const m of chatMessages) {
    // 真实发送的文本
    let filesText = ''
    let linksText = ''

    // 将文件内容拼接到用户消息中
    if (!ignoreFile && m.files && m.files.length > 0) {
      appStateStore.loadFileFlag = true
      const fileContentList: Record<string, string> = {}
      for (const f of m.files) {
        fileContentList[f.name] = await langChainLoadFile(join(appStateStore.cachePath, f.saveName))
      }
      filesText = `Files Data:\n${JSON.stringify(fileContentList)}\n`
      appStateStore.loadFileFlag = false
    }

    // 将网页内容拼接到用户消息中
    if (!ignoreLink && m.links && m.links.length > 0) {
      appStateStore.readWebFlag = true
      const webContentList: Record<string, string> = {}
      for (const l of m.links) {
        webContentList[l.url] = await readWebBodyByUrl(l.url)
      }
      linksText = `Web Pages Content:\n${JSON.stringify(webContentList)}\n`
      appStateStore.readWebFlag = false
    }

    // 文本消息
    const content = [
      { type: 'text', text: filesText + linksText + m.content }
    ] as OpenAI.ChatCompletionContentPart[]

    // 处理用户消息中的图片
    if (!ignoreFile && m.role === 'user' && m.images && m.images.length > 0) {
      for (const image of m.images) {
        const imageBase64Data = await readLocalImageBase64(
          join(appStateStore.cachePath, image.saveName)
        )
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/${image.extname.replace('.', '')};base64,${imageBase64Data}`
          }
        })
      }
    }

    convertMessageResult.push({
      role: m.role,
      content: content
    } as OpenAI.ChatCompletionMessageParam)
  }

  // 追加记忆数据
  if (
    !ignoreMemory &&
    chatSessionStore.getActiveSession!.memoryOption.enabled &&
    chatMemoryStore.memoryList.length > 0
  ) {
    convertMessageResult.unshift({
      role: 'system',
      content: `These are your memory data: ${JSON.stringify(chatMemoryStore.memoryList)}`
    })
  }

  return convertMessageResult
}

// 流式回答
const streamAnswer = (
  content = '',
  images?: ChatMessageFile[],
  searchItems?: InternetSearchResultItem[]
) => {
  if (!appStateStore.chatAnswerFlag) {
    chatSessionStore.pushMessage({
      type: 'chat',
      role: 'assistant',
      content: content,
      images: images,
      searchItems: searchItems
    })
    appStateStore.chatAnswerFlag = true
  }
  chatSessionStore.appendMessageContent(content, images, searchItems)
}

// 错误回答
const errorAnswer = (content: string) => {
  // 先关闭之前的回答
  finishAnswer()
  chatSessionStore.pushMessage({
    type: 'error',
    role: 'assistant',
    content: content
  })
}

// 完成回答
const finishAnswer = (noSessionNameFlag?: boolean, regenerateFlag?: boolean) => {
  const latestMessage = chatSessionStore.getActiveSession!.messages.at(-1)!

  // 如果最后一条回答是空的内容则删除
  if (!latestMessage.content) {
    chatSessionStore.deleteMessage(latestMessage.id!)
  } else {
    // 自动生成标题
    if (
      noSessionNameFlag &&
      chatSessionStore.getActiveSession!.chatOption.autoGenerateSessionName
    ) {
      generateSessionName(chatSessionStore.getActiveSession!.id!)
    }

    // 保存当前回答到最后一个choice
    if (regenerateFlag) {
      chatSessionStore.saveChoice()
    }

    // 通知
    if (!appStateStore.mainWindowFocusFlag) {
      notification(t('app.notification.newReply'), latestMessage.content, showMainWindow)
    }
  }

  // 修改状态
  appStateStore.chatAnswerFlag = false
  appStateStore.chatLoadingFlag = false
}

// 停止回答
const stopAnswer = () => {
  abortCtr.abort()
  abortCtr = new AbortController()
  finishAnswer()
}

// 生成会话名称
const generateSessionName = async (sessionId: string) => {
  let sessionName = ''

  // OpenAI对话
  await openaiChat({
    baseURL: appSettingStore.openAI.baseUrl,
    apiKey: appSettingStore.openAI.apiKey,
    params: {
      stream: true,
      stream_options: {
        include_usage: true
      },
      model: chatSessionStore.getActiveSession!.chatOption.model,
      messages: [
        ...(await convertMessages(
          chatSessionStore.getActiveSession!.messages,
          undefined,
          undefined,
          true,
          true,
          true
        )),
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: t('app.chat.prompt.generateTitle')
            }
          ]
        }
      ]
    },
    answer: (chunk: OpenAI.ChatCompletionChunk) => {
      // 拼接名称
      sessionName += chunk.choices[0]?.delta.content?.trim() ?? ''
      // 根据id获取session
      const session = chatSessionStore.getSessionById(sessionId)
      if (session && sessionName.length > 0) {
        session.name = sessionName
      }

      // 用量统计
      usageStatistic(chunk.usage!)
    }
  })
}

// 重新生成
const regenerate = (messageId: string) => {
  // 删除之后的所有消息
  if (!chatSessionStore.deleteMessagesFrom(messageId)) {
    return
  }

  // 最新一条消息
  const latestMessage = chatSessionStore.getActiveSession!.messages.at(-1)!

  // 错误消息修改类型即可
  if (latestMessage.type === 'error') {
    latestMessage.type = 'chat'
  } else {
    chatSessionStore.pushChoice()
  }

  // 清空当前内容
  chatSessionStore.clearLatestMessage()

  // 重新生成
  sendQuestion(undefined, true)
}

// 选择附件
const selectAttachment = async (files?: SelectFile[]) => {
  if (appStateStore.uploadFlag) {
    return
  }
  appStateStore.uploadFlag = true

  try {
    // 支持图片类型：https://platform.openai.com/docs/guides/vision/what-type-of-files-can-i-upload

    // 没有传入文件列表，则触发文件选择器
    if (!files) {
      files = await selectFile(
        true,
        [...AppConfig.imageExtensions, ...AppConfig.fileExtensions].map((e) => e.replace('.', ''))
      )
    }

    for (const file of files) {
      // 保存文件到缓存目录
      let saveName = ''
      if (file.base64) {
        saveName = await saveFileByBase64(file.base64, `${generateUUID()}${file.extname}`)
      } else if (file.path) {
        saveName = await saveFileByPath(file.path, `${generateUUID()}${file.extname}`)
      } else {
        continue
      }
      const chatFile: ChatMessageFile = {
        name: file.name,
        saveName: saveName,
        extname: file.extname,
        size: file.size
      }

      // 图片和文件分开存储
      if (AppConfig.imageExtensions.includes(chatFile.extname.toLowerCase())) {
        data.imageList.push(chatFile)
      } else if (AppConfig.fileExtensions.includes(chatFile.extname.toLowerCase())) {
        data.fileList.push(chatFile)
      }
    }
  } catch (error) {
    Logger.error('selectAttachment error: ', error)
  } finally {
    appStateStore.uploadFlag = false
  }
}

// 选择网页链接
const selectWebLink = () => {
  ElMessageBox.prompt(t('app.chat.body.input.link.prompt'), t('app.chat.body.input.link.title'), {
    confirmButtonText: t('app.common.confirm'),
    cancelButtonText: t('app.common.cancel'),
    beforeClose: (action: Action, instance: MessageBoxState, done: () => void) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true

        // 校验 URL 格式
        if (
          !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(instance.inputValue)
        ) {
          ElMessage.error(t('app.chat.body.input.link.urlError'))
          instance.confirmButtonLoading = false
          return
        }

        // 加载网页内容
        readWebBodyByUrl(instance.inputValue)
          .then((content) => {
            if (content) {
              done()
            } else {
              ElMessage.error(t('app.chat.body.input.link.loadError'))
            }
          })
          .catch(() => {
            ElMessage.error(t('app.chat.body.input.link.loadError'))
          })
          .finally(() => {
            instance.confirmButtonLoading = false
          })
      } else {
        done()
      }
    }
  }).then(({ value }) => {
    data.linkList.push({
      url: value
    })
  })
}

// 选择屏幕截图
const openScreenshotDialog = () => {
  checkDesktopScreenshots()
    .then(() => {
      data.screenshotDialogVisible = true
    })
    .catch((error: any) => {
      ElMessageBox.alert(t('app.chat.body.screenshot.guide'), t('app.chat.body.screenshot.error'), {
        callback: () => {
          optionDesktopScreenshots()
        }
      })
      Logger.error('checkDesktopScreenshots error: ', error.message)
    })
}

// 输入框粘贴监听
const handleInputPaste = async (event: ClipboardEvent) => {
  // 获取粘贴的内容
  const items = event.clipboardData?.items
  if (!items || items.length === 0) {
    return
  }

  // 如果有文件
  if (items[0].kind === 'file') {
    // 阻止默认粘贴行为
    event.preventDefault()
  }

  // 遍历所有文件，需要先将getAsFile的结果存到数组，循环内不可有await
  const extensionList = [...AppConfig.imageExtensions, ...AppConfig.fileExtensions]
  const files: File[] = []
  for (const item of items) {
    if (item && item.kind === 'file') {
      // 获取文件数据
      const file = item.getAsFile()
      if (file) {
        const name = file.name
        const extname = getFileExtension(name)

        if (!extensionList.includes(extname.toLowerCase())) {
          continue
        }

        files.push(file)
      }
    }
  }

  // 遍历所有文件
  const selectFiles: SelectFile[] = []
  for (const file of files) {
    if (file) {
      const name = file.name
      const extname = getFileExtension(name)

      if (!extensionList.includes(extname.toLowerCase())) {
        continue
      }

      const base64 = await fileToBase64(file)
      selectFiles.push({
        name: file.name,
        extname: extname,
        base64: base64,
        size: file.size
      })
    }
  }

  await selectAttachment(selectFiles)
}

// 删除图片
const deleteImage = (index: number) => {
  data.imageList.splice(index, 1)
}

// 删除文件
const deleteFile = (index: number) => {
  data.fileList.splice(index, 1)
}

// 删除连接
const deleteLink = (index: number) => {
  data.linkList.splice(index, 1)
}

// 修改问题输入
const updateQuestion = (prompt: string) => {
  data.question = prompt
}

// 选择截图
const selectScreenshot = (screenshot: DesktopScreenshot) => {
  // 关闭对话窗
  data.screenshotDialogVisible = false

  // 随机名称
  const extname = '.png'
  const saveName = `${generateUUID()}${extname}`

  // 保存到本地
  saveFileByBase64(screenshot.thumbnail, saveName).then(() => {
    // 保存成功后添加到图片预览
    data.imageList.push({
      name: `${screenshot.name}${extname}`,
      saveName: saveName,
      extname: extname
    })
  })
}

// 用量统计
const usageStatistic = (usage?: OpenAI.CompletionUsage) => {
  if (!usage) {
    return
  }
  chatSessionStore.usageStatistic({
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens
  })
  Logger.info('usage statistic', usage.prompt_tokens, usage.completion_tokens, usage.total_tokens)
}

// 暴露函数
defineExpose({
  regenerate,
  updateQuestion,
  selectAttachment
})

onMounted(() => {
  // 自动聚焦
  inputTextareaFocus()
})
</script>

<template>
  <div class="chat-body-input">
    <el-button
      v-if="chatSessionStore.getActiveSession!.archived"
      @click="chatSessionStore.unarchived(chatSessionStore.getActiveSession!.id!)"
    >
      <el-space>
        <AppIcon name="unarchived" :size="18" />
        <div>{{ $t('app.chat.body.input.unarchived') }}</div>
      </el-space>
    </el-button>
    <template v-else>
      <div class="question-input">
        <!-- 图片列表 -->
        <transition name="el-fade-in">
          <div v-if="imageList.length > 0" class="question-input-attachment-list">
            <transition-group name="el-fade-in">
              <div v-for="(att, index) in imageList" :key="att.saveName" class="image-item">
                <el-image
                  class="item-image"
                  :src="`file://${join(appStateStore.cachePath, att.saveName)}`"
                  :preview-src-list="
                    imageList.map((a) => `file://${join(appStateStore.cachePath, a.saveName)}`)
                  "
                  :initial-index="index"
                  fit="cover"
                />
                <CircleCloseFilled class="item-close-btn" @click.stop="deleteImage(index)" />
              </div>
            </transition-group>
          </div>
        </transition>

        <!-- 文件列表 -->
        <transition name="el-fade-in">
          <div v-if="fileList.length > 0" class="question-input-attachment-list">
            <transition-group name="el-fade-in">
              <div
                v-for="(att, index) in fileList"
                :key="att.saveName"
                class="file-item"
                @click="showItemInFolder(join(appStateStore.cachePath, att.saveName))"
              >
                <FileIcon class="file-icon" :extname="att.extname.toLowerCase()" />
                <div class="file-item-body">
                  <div class="file-item-name">{{ att.saveName }}</div>
                  <div class="file-item-size">{{ formatFileSize(att.size) }}</div>
                </div>
                <CircleCloseFilled class="item-close-btn" @click.stop="deleteFile(index)" />
              </div>
            </transition-group>
          </div>
        </transition>

        <!-- 链接列表 -->
        <transition name="el-fade-in">
          <div v-if="linkList.length > 0" class="question-input-attachment-list">
            <transition-group name="el-fade-in">
              <div
                v-for="(att, index) in linkList"
                :key="att.url"
                class="link-item"
                @click="openInBrowser(att.url)"
              >
                <AppIcon class="link-icon" name="with-net" />
                <div class="link-item-body">
                  <div class="link-item-name">{{ att.url }}</div>
                </div>
                <CircleCloseFilled class="item-close-btn" @click.stop="deleteLink(index)" />
              </div>
            </transition-group>
          </div>
        </transition>

        <div class="question-input-textarea-container">
          <!-- 附件选择 -->
          <el-tooltip :content="$t('app.chat.body.input.attachment.title')">
            <el-dropdown
              trigger="click"
              :disabled="appStateStore.chatLoadingFlag"
              placement="top-start"
            >
              <AppIcon name="attachment" class="attachment-btn" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="Document" @click="selectAttachment()">
                    {{ $t('app.chat.body.input.attachment.localFile') }}
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Link" @click="selectWebLink()">
                    {{ $t('app.chat.body.input.attachment.webLink') }}
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Monitor" @click="openScreenshotDialog()">
                    {{ $t('app.chat.body.screenshot.title') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-tooltip>

          <!-- 文本域 -->
          <el-mention
            ref="questionTextareaRef"
            v-model="question"
            type="textarea"
            :placeholder="$t('app.chat.body.input.question.placeholder')"
            :autosize="{ minRows: 1, maxRows: 8 }"
            resize="none"
            :options="mentionOptions"
            whole
            @keydown.enter="sendQuestion"
            @paste="handleInputPaste"
          />

          <!-- 发送按钮 -->
          <el-tooltip
            v-if="!appStateStore.chatLoadingFlag"
            :content="$t('app.chat.body.input.send')"
          >
            <Promotion
              class="question-input-btn"
              :class="{
                'question-input-btn-available':
                  question.trim().length > 0 && !appStateStore.uploadFlag
              }"
              @click="sendQuestion"
            />
          </el-tooltip>

          <!-- 停止按钮 -->
          <el-tooltip v-else :content="$t('app.chat.body.input.stop')">
            <AppIcon
              name="stop"
              class="question-input-btn question-input-btn-available"
              @click="stopAnswer()"
            />
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 屏幕截图选择对话窗 -->
    <el-dialog
      v-model="screenshotDialogVisible"
      :title="$t('app.chat.body.screenshot.title')"
      width="700"
      align-center
      destroy-on-close
    >
      <ChatBodyScreenshotList @select-screenshot="selectScreenshot" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.chat-body-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0 $app-padding-base $app-padding-base $app-padding-base;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $app-padding-small;

  .question-input {
    min-width: 0;
    flex: 1 1 0;
    border-radius: $app-border-radius-base;
    overflow: hidden;
    background-color: var(--el-fill-color);
    display: flex;
    flex-direction: column;

    .question-input-attachment-list {
      box-sizing: border-box;
      padding: $app-padding-small $app-padding-small 0 $app-padding-small;
      display: flex;
      gap: $app-padding-small;
      flex-wrap: wrap;

      .image-item {
        height: $app-chat-input-image-height;
        width: $app-chat-input-image-height;
        position: relative;

        .item-image {
          height: 100%;
          width: 100%;
          border-radius: $app-border-radius-base;
          cursor: pointer;
        }

        .item-close-btn {
          height: $app-icon-size-small;
          width: $app-icon-size-small;
          position: absolute;
          top: calc($app-icon-size-small / -2);
          right: calc($app-icon-size-small / -2);
          cursor: pointer;
        }
      }

      .file-item {
        height: $app-chat-input-file-height;
        max-width: 100%;
        box-sizing: border-box;
        padding: $app-padding-small;
        background-color: var(--el-fill-color-darker);
        border-radius: $app-border-radius-base;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $app-padding-extra-small;
        cursor: pointer;

        .item-close-btn {
          height: $app-icon-size-small;
          width: $app-icon-size-small;
          position: absolute;
          top: calc($app-icon-size-small / -2);
          right: calc($app-icon-size-small / -2);
          cursor: pointer;
        }

        .file-icon {
          flex-shrink: 0;
          height: 100%;
        }

        .file-item-body {
          height: 100%;
          min-width: 0;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .file-item-name {
            font-size: var(--el-font-size-base);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .file-item-size {
            font-size: var(--el-font-size-small);
            color: var(--el-text-color-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .link-item {
        height: calc($app-line-height-base + $app-padding-small * 2);
        max-width: 100%;
        box-sizing: border-box;
        padding: $app-padding-small;
        background-color: var(--el-fill-color-darker);
        border-radius: $app-border-radius-base;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $app-padding-extra-small;
        cursor: pointer;

        .item-close-btn {
          height: $app-icon-size-small;
          width: $app-icon-size-small;
          position: absolute;
          top: calc($app-icon-size-small / -2);
          right: calc($app-icon-size-small / -2);
          cursor: pointer;
        }

        .link-icon {
          flex-shrink: 0;
          height: 100%;
        }

        .link-item-body {
          height: 100%;
          min-width: 0;
          flex-grow: 1;

          .link-item-name {
            line-height: $app-line-height-base;
            font-size: var(--el-font-size-base);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .question-input-textarea-container {
      width: 100%;
      display: flex;
      align-items: flex-end;

      .attachment-btn {
        flex-shrink: 0;
        height: $app-icon-size-large;
        width: $app-icon-size-large;
        box-sizing: border-box;
        padding: $app-padding-small;
        cursor: pointer;
        outline: none;
        color: var(--el-text-color-primary);
      }

      :deep(.el-textarea__inner) {
        padding: $app-padding-small $app-padding-extra-small $app-padding-small 0;
        box-shadow: none;
        background-color: var(--el-fill-color);
      }

      .question-input-btn {
        flex-shrink: 0;
        height: $app-icon-size-large;
        width: $app-icon-size-large;
        box-sizing: border-box;
        padding: $app-padding-small;
        outline: none;
        color: var(--el-color-primary);
        cursor: not-allowed;

        &-available {
          cursor: pointer;
        }
      }
    }
  }
}
</style>

<script setup lang="ts">
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import { clipboardWriteText } from '@renderer/service/ipc-service'
import { Logger } from '@renderer/service/logger-service'
import { openaiSpeech } from '@renderer/service/openai-service'
import { useStore } from '@renderer/store/store'
import { reactive, toRefs } from 'vue'

// 仓库
const { chatSessionStore, appStateStore, appSettingStore } = useStore()

// 数据绑定
const data = reactive({
  speechLoading: false,
  speechFlag: false
})
const { speechLoading, speechFlag } = toRefs(data)

// 定义事件
const emits = defineEmits(['regenerate', 'clear-context'])

// 组件传参
const message = defineModel<ChatMessage>('message', {
  default: () => {}
})

// 音频播放对象
const audioContext = new AudioContext()
let audioBufferSource = audioContext.createBufferSource()

// 发音
const speechStart = () => {
  if (data.speechLoading) {
    return
  }
  data.speechLoading = true

  // 调用发音能力
  openaiSpeech({
    apiKey: appSettingStore.openAI.apiKey,
    baseURL: appSettingStore.openAI.baseUrl,
    params: {
      input: message.value.content,
      model: chatSessionStore.getActiveSession!.speechOption.model,
      voice: chatSessionStore.getActiveSession!.speechOption.voice,
      speed: chatSessionStore.getActiveSession!.speechOption.speed
    }
  })
    .then((audioData) => {
      // 断开之前的音频连接
      audioBufferSource.disconnect()
      // 创建新的数据源对象
      audioBufferSource = audioContext.createBufferSource()
      // 转换音频数据
      audioContext.decodeAudioData(
        audioData,
        (buffer) => {
          // 设置缓冲区数据
          audioBufferSource.buffer = buffer

          // 连接到输出设备
          audioBufferSource.connect(audioContext.destination)

          // 播放音频
          audioBufferSource.start()

          // 修改状态
          data.speechLoading = false
          data.speechFlag = true

          // 播放结束
          audioBufferSource.onended = () => {
            data.speechFlag = false
          }
        },
        (error) => {
          data.speechFlag = false
          Logger.error('Error decoding audio data: ', error.message)
        }
      )
    })
    .catch((error) => {
      data.speechLoading = false
      Logger.error('openai speech error: ', error.message)
    })
}

// 停止发音
const speechStop = () => {
  // 断开音频连接
  audioBufferSource.disconnect()
  data.speechFlag = false
}

// 清空上下文
const clearContext = (messageId: string) => {
  if (!appStateStore.chatLoadingFlag) {
    chatSessionStore.clearContext(messageId)
    if (chatSessionStore.getActiveSession?.messages.at(-2)?.id === messageId) {
      emits('clear-context')
    }
  }
}
</script>

<template>
  <div
    class="chat-message-console-container"
    :class="{
      'chat-message-console-container-visible':
        chatSessionStore.getActiveSession?.messages.at(-1)?.id == message.id
    }"
  >
    <div class="chat-message-console">
      <template v-if="message.type === 'chat' && message.role === 'assistant' && message.choices">
        <el-button
          text
          circle
          @click="!appStateStore.chatLoadingFlag && chatSessionStore.changeChoice(message.id!, -1)"
        >
          <AppIcon name="arrow-left" :size="18" />
        </el-button>
        <div>{{ (message.choiceIndex ?? 0) + 1 }} / {{ message.choices.length }}</div>
        <el-button
          text
          circle
          @click="!appStateStore.chatLoadingFlag && chatSessionStore.changeChoice(message.id!, 1)"
        >
          <AppIcon name="arrow-right" :size="18" />
        </el-button>
      </template>
      <template v-if="message.content && message.content.length > 0">
        <el-button v-if="speechFlag" text circle @click="speechStop()">
          <AppIcon name="stop" :size="18" />
        </el-button>
        <el-button v-else text circle @click="speechStart()">
          <AppIcon v-if="speechLoading" class="rotate" name="loading" :width="18" :height="18" />
          <AppIcon v-else name="speech" :size="18" />
        </el-button>
      </template>
      <el-button text circle @click="clipboardWriteText(message.content)">
        <AppIcon name="copy" :size="18" />
      </el-button>
      <template v-if="!chatSessionStore.getActiveSession!.archived">
        <template
          v-if="
            message.role === 'assistant' &&
            chatSessionStore.getActiveSession!.messages.at(0)?.id != message.id
          "
        >
          <el-button text circle @click="!appStateStore.chatLoadingFlag && emits('regenerate')">
            <AppIcon name="refresh" :size="18" />
          </el-button>
        </template>
        <el-button text circle>
          <AppIcon name="divider" :size="18" @click="clearContext(message.id!)" />
        </el-button>
        <el-button
          text
          circle
          @click="!appStateStore.chatLoadingFlag && chatSessionStore.deleteMessage(message.id!)"
        >
          <AppIcon name="delete" :size="18" />
        </el-button>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-message-console-container {
  &-visible {
    opacity: 1 !important;
  }

  .chat-message-console {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    button {
      margin: 0;
    }
  }
}
</style>

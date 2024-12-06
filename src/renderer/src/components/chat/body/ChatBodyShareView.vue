<script setup lang="ts">
import { CopyDocument, Download } from '@element-plus/icons-vue'
import ChatMessageAssistant from '@renderer/components/chat/message/ChatMessageAssistant.vue'
import ChatMessageDivider from '@renderer/components/chat/message/ChatMessageDivider.vue'
import ChatMessageError from '@renderer/components/chat/message/ChatMessageError.vue'
import ChatMessageUser from '@renderer/components/chat/message/ChatMessageUser.vue'
import { clipboardWriteImage } from '@renderer/service/ipc-service'
import { useStore } from '@renderer/store/store'
import { nowTimestamp } from '@renderer/utils/date-util'
import { toPng } from 'html-to-image'
import { reactive } from 'vue'

// 仓库
const { chatSessionStore } = useStore()

// 定义事件
const emits = defineEmits(['ok'])

// 组件传参
const visible = defineModel<boolean>('visible', {
  default: () => false
})
const messageCheckIds = defineModel<string[]>('messageCheckIds', {
  default: () => []
})

// 数据绑定
const data = reactive({
  shareImageUrl: ''
})

// 生成分享图片
const generateShareImage = async () => {
  const el = document.getElementById('share-view-content')
  if (el) {
    data.shareImageUrl = await toPng(el, {
      quality: 1
    })
  }
}

// 复制图片
const copyImage = async () => {
  await generateShareImage()
  await clipboardWriteImage(data.shareImageUrl)
  visible.value = false
  emits('ok')
}

// 保存图片
const saveImage = async () => {
  await generateShareImage()
  const link = document.createElement('a')
  link.download = `share-image-${nowTimestamp()}`
  link.href = data.shareImageUrl
  link.click()
  visible.value = false
  emits('ok')
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="$t('app.chat.body.share.image.title')"
    width="700"
    align-center
    destroy-on-close
  >
    <div class="dialog-body">
      <el-scrollbar height="100%">
        <div id="share-view-content" class="share-view-content">
          <div class="message-list-container">
            <div
              v-for="m in chatSessionStore.getActiveSession!.messages.filter((msg) =>
                messageCheckIds.includes(msg.id!)
              )"
              :key="m.id"
              class="message-container"
            >
              <!-- 对话消息 -->
              <template v-if="m.type === 'chat'">
                <template v-if="m.role === 'user'">
                  <ChatMessageUser :message="m" :has-console="false" />
                </template>
                <template v-else-if="m.role === 'assistant'">
                  <ChatMessageAssistant :message="m" :has-console="false" />
                </template>
              </template>

              <!-- 错误消息 -->
              <template v-else-if="m.type === 'error'">
                <ChatMessageError :message="m" :has-console="false" />
              </template>

              <!-- 分隔消息 -->
              <template v-else-if="m.type === 'divider'">
                <ChatMessageDivider :message="m" />
              </template>
            </div>
          </div>
          <el-divider class="share-view-content-divider" />
          <div class="share-view-content-footer">
            <img class="app-logo" alt="qr-code" src="../../../assets/image/app-logo.png" />
            <div class="app-info">
              <div class="app-name">Strawberry</div>
              <div class="model-info">
                {{
                  $t('app.chat.body.share.modelInfo').replace(
                    '_',
                    chatSessionStore.getActiveSession!.chatOption.model
                  )
                }}
              </div>
            </div>
            <img class="qr-code" alt="qr-code" src="@renderer/assets/image/github-qr-code.png" />
          </div>
        </div>
      </el-scrollbar>
    </div>
    <template #footer>
      <el-button @click="visible = false">
        {{ $t('app.chat.body.share.image.cancel') }}
      </el-button>
      <el-button :icon="CopyDocument" @click="copyImage()">
        {{ $t('app.chat.body.share.image.copy') }}
      </el-button>
      <el-button :icon="Download" @click="saveImage()">
        {{ $t('app.chat.body.share.image.save') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-body {
  height: $app-dialog-height;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;

  .share-view-content {
    background-color: var(--el-fill-color-extra-light);

    .share-view-content-divider {
      width: calc(100% - 2 * $app-padding-base);
      margin: 0 $app-padding-base;
    }

    .share-view-content-footer {
      height: 50px;
      padding: $app-padding-base;
      display: flex;
      align-content: center;
      gap: $app-padding-small;

      .app-logo {
        height: 100%;
      }

      .app-info {
        height: 100%;
        box-sizing: border-box;
        padding: 5px 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;

        .app-name {
          font-size: var(--el-font-size-base);
          color: var(--el-text-color-regular);
        }

        .model-info {
          font-size: var(--el-font-size-extra-small);
          color: var(--el-text-color-secondary);
        }
      }

      .qr-code {
        height: 100%;
        margin-left: auto;
      }
    }

    .message-list-container {
      width: 100%;
      overflow-x: hidden;
      background-color: var(--el-fill-color-extra-light);
      box-sizing: border-box;
      padding: $app-padding-base;
      display: flex;
      flex-direction: column;
      gap: $app-padding-base;

      .message-container {
        width: 100%;
        display: flex;
        gap: $app-padding-base;
        align-items: center;
      }
    }
  }
}
</style>

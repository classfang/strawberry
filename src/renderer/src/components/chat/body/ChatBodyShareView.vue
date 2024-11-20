<script setup lang="ts">
import { CopyDocument, Download } from '@element-plus/icons-vue'
import { clipboardWriteImage } from '@renderer/service/ipc-service'
import { Logger } from '@renderer/service/logger-service'
import { useStore } from '@renderer/store/store'
import { nowTimestamp } from '@renderer/utils/date-util'
import { toPng } from 'html-to-image'
import { watch, reactive, toRefs } from 'vue'

// 仓库
const { chatSessionStore } = useStore()

// 定义事件
const emits = defineEmits(['ok'])

// 组件传参
const visible = defineModel<boolean>('visible', {
  default: () => false
})

// 数据绑定
const data = reactive({
  messageListImageUrl: '',
  shareImageUrl: ''
})
const { messageListImageUrl } = toRefs(data)

// 监听弹窗显示，重新获取图片
watch(
  () => visible.value,
  () => {
    if (visible.value) {
      const el = document.getElementById('message-list-container')
      if (el) {
        toPng(el, {
          quality: 1,
          filter: (domNode: HTMLElement) => domNode.dataset?.shareHide !== 'true'
        })
          .then((dataUrl) => {
            data.messageListImageUrl = dataUrl
            generateShareImage()
          })
          .catch((e: any) => {
            Logger.error(e.message)
          })
      }
    }
  }
)

// 生成分享图片
const generateShareImage = () => {
  const el = document.getElementById('share-view-content')
  if (el) {
    toPng(el, {
      quality: 1
    })
      .then((dataUrl) => {
        data.shareImageUrl = dataUrl
        generateShareImage()
      })
      .catch((e: any) => {
        Logger.error(e.message)
      })
  }
}

// 复制图片
const copyImage = () => {
  clipboardWriteImage(data.shareImageUrl)
  visible.value = false
  emits('ok')
}

// 保存图片
const saveImage = () => {
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
          <el-image v-if="messageListImageUrl" :src="messageListImageUrl" />
          <el-divider class="share-view-content-divider" />
          <div class="share-view-content-footer">
            <img class="qr-code" alt="qr-code" src="@renderer/assets/image/github-qr-code.png" />
            <div class="model-info">
              <div class="model-info-name">
                {{ chatSessionStore.getActiveSession!.chatOption.model }}
              </div>
              <div class="model-info-from">Power by OpenAI</div>
            </div>
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
      height: 45px;
      padding: $app-padding-base;
      display: flex;
      align-content: center;
      justify-content: space-between;

      .qr-code {
        height: 100%;
      }

      .model-info {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;

        .model-info-name {
          font-size: var(--el-font-size-base);
          color: var(--el-text-color-secondary);
        }

        .model-info-from {
          font-size: var(--el-font-size-extra-small);
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>

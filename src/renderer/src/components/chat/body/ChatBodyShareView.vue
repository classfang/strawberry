<script setup lang="ts">
import { CopyDocument, Download } from '@element-plus/icons-vue'
import { clipboardWriteImage } from '@renderer/service/ipc-service'
import { Logger } from '@renderer/service/logger-service'
import { nowTimestamp } from '@renderer/utils/date-util'
import { toJpeg } from 'html-to-image'
import { watch, reactive, toRefs } from 'vue'

// 定义事件
const emits = defineEmits(['ok'])

// 组件传参
const visible = defineModel<boolean>('visible', {
  default: () => false
})

// 数据绑定
const data = reactive({
  shareImageUrl: ''
})
const { shareImageUrl } = toRefs(data)

// 监听弹窗显示，重新获取图片
watch(
  () => visible.value,
  () => {
    if (visible.value) {
      const el = document.getElementById('message-list-container')
      if (el) {
        toJpeg(el, {
          quality: 1,
          filter: (domNode: HTMLElement) => domNode.dataset?.shareHide !== 'true'
        })
          .then((dataUrl) => {
            data.shareImageUrl = dataUrl
          })
          .catch((e: any) => {
            Logger.error(e.message)
          })
      }
    }
  }
)

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
        <el-image v-if="shareImageUrl" :src="shareImageUrl" />
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
}
</style>

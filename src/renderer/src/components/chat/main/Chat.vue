<script setup lang="ts">
import ChatBody from '@renderer/components/chat/body/ChatBody.vue'
import ChatSidebar from '@renderer/components/chat/sidebar/ChatSidebar.vue'
import { AppConfig } from '@renderer/config/AppConfig'
import { useStore } from '@renderer/store/store'
import { fileToBase64 } from '@renderer/utils/base64-util'
import { getFileExtension } from '@renderer/utils/file-util'
import { useTimeoutFn } from '@vueuse/core'
import { reactive, ref, toRefs } from 'vue'

// 仓库
const { chatSessionStore } = useStore()

// ref
const chatBodyRef = ref()

// 数据绑定
const data = reactive({
  dragMaskState: 0
})
const { dragMaskState } = toRefs(data)

// 文件拖入相关事件处理
const dragTimeout = useTimeoutFn(() => {
  data.dragMaskState = 0
}, 300)
const handleDragEnter = () => {
  data.dragMaskState = 1
}
const handleDragOver = () => {
  dragTimeout.stop()
}
const handleDragLeave = () => {
  dragTimeout.start()
}
const handleDrop = async (event: DragEvent) => {
  data.dragMaskState = 2

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }

  const extensionList = [...AppConfig.imageExtensions, ...AppConfig.fileExtensions]
  const selectFiles: SelectFile[] = []
  for (const file of files) {
    const extension = getFileExtension(file.name)
    if (!extensionList.includes(extension.toLowerCase())) {
      continue
    }

    const base64 = await fileToBase64(file)
    selectFiles.push({
      name: file.name,
      extname: extension,
      base64: base64,
      size: file.size
    })
  }
  await chatBodyRef.value.selectAttachment(selectFiles)

  data.dragMaskState = 0
}
</script>

<template>
  <div
    v-loading="dragMaskState > 0"
    :element-loading-text="
      dragMaskState === 2 ? $t('app.chat.dragMask.loading') : $t('app.chat.dragMask.tips')
    "
    element-loading-custom-class="drag-mask"
    class="chat"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- 侧边栏 -->
    <ChatSidebar />

    <!-- 主体 -->
    <ChatBody
      v-if="chatSessionStore.getActiveSession"
      ref="chatBodyRef"
      :key="chatSessionStore.getActiveSession.id"
    />
  </div>
</template>

<style lang="scss" scoped>
.chat {
  height: 100%;
  width: 100%;
  display: flex;

  :deep(.drag-mask) {
    .el-loading-spinner {
      .circular {
        display: none;
      }

      .el-loading-text {
        font-size: var(--el-font-size-large);
      }
    }
  }
}
</style>

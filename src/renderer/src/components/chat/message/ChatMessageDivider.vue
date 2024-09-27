<script setup lang="ts">
import { useStore } from '@renderer/store/store'
import { reactive, toRefs } from 'vue'

// 仓库
const { chatSessionStore, appStateStore } = useStore()

// 组件传参
const message = defineModel<ChatMessage>('message', {
  default: () => {}
})

// 数据绑定
const data = reactive({
  mouseEnterFlag: false
})
const { mouseEnterFlag } = toRefs(data)
</script>

<template>
  <div class="chat-message-divider">
    <el-divider class="divider">
      <div
        class="divider-content"
        @mouseenter="mouseEnterFlag = !chatSessionStore.getActiveSession!.archived"
        @mouseleave="mouseEnterFlag = false"
      >
        <transition name="slide-in-top" mode="out-in">
          <div
            v-if="mouseEnterFlag"
            class="cancel-btn"
            @click="!appStateStore.chatLoadingFlag && chatSessionStore.deleteMessage(message.id!)"
          >
            {{ $t('app.chat.body.message.disconnectedContextCancel') }}
          </div>
          <div v-else>
            {{ $t('app.chat.body.message.disconnectedContext') }}
          </div>
        </transition>
      </div>
    </el-divider>
  </div>
</template>

<style lang="scss" scoped>
.chat-message-divider {
  width: 100%;
  flex: 1 1 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: $app-padding-small;

  .divider {
    :deep(.el-divider__text) {
      background-color: var(--el-fill-color-extra-light);
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-small);
      padding: 0 $app-padding-base;

      .divider-content {
        cursor: pointer;
        overflow-y: hidden;

        .cancel-btn {
          color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>

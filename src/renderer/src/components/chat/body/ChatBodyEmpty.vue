<script setup lang="ts">
import ChatBodyPrompt from '@renderer/components/chat/body/ChatBodyPrompt.vue'

// 事件
const emits = defineEmits(['use-prompt'])
</script>

<template>
  <div class="chat-body-empty">
    <div class="empty-container">
      <div class="empty-content">{{ $t('app.chat.body.empty.content') }}</div>
    </div>
    <ChatBodyPrompt @use-prompt="(prompt) => emits('use-prompt', prompt)" />
  </div>
</template>

<style lang="scss" scoped>
.chat-body-empty {
  min-height: 0;
  width: 100%;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $app-padding-large;

  .empty-container {
    width: 100%;
    box-sizing: border-box;
    padding: 0 $app-padding-large;

    .empty-content {
      font-size: $app-font-size-extra-large;
      font-weight: var(--el-font-weight-primary);
    }
  }
}
</style>

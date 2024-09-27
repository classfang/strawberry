<script setup lang="ts">
import ChatBodyPrompt from '@renderer/components/chat/body/ChatBodyPrompt.vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'

// 事件
const emits = defineEmits(['use-prompt'])
</script>

<template>
  <div class="chat-body-empty">
    <AppIcon name="logo" class="app-logo" />
    <div>{{ $t('app.chat.body.empty.content') }}</div>
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
  font-size: var(--el-font-size-large);

  .app-logo {
    height: $app-icon-size-large;
    width: $app-icon-size-large;
  }
}
</style>

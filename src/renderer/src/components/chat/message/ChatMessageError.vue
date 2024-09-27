<script setup lang="ts">
import ChatMessageConsole from '@renderer/components/chat/message/ChatMessageConsole.vue'

// 组件传参
const message = defineModel<ChatMessage>('message', {
  default: () => {}
})

// 定义事件
const emits = defineEmits(['regenerate', 'clear-context'])
</script>

<template>
  <div class="chat-message-error">
    <div class="message-content-container">
      <div class="message-content select-text">{{ message.content }}</div>
      <ChatMessageConsole
        v-model:message="message"
        class="message-console"
        @regenerate="emits('regenerate')"
        @clear-context="emits('clear-context')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-message-error {
  width: 100%;
  flex: 1 1 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: $app-padding-small;

  .message-content-container {
    min-width: 0;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $app-padding-extra-small;

    .message-content {
      min-width: calc($app-line-height-large + $app-padding-base * 2);
      max-width: 90%;
      flex: 1 1 0;
      white-space: pre-wrap;
      line-break: anywhere;
      background-color: var(--el-fill-color-light);
      box-sizing: border-box;
      padding: $app-padding-small $app-padding-base;
      border-radius: $app-border-radius-base;
      line-height: $app-line-height-large;
      display: flex;
      justify-content: center;
      color: var(--el-color-error);
      font-size: var(--el-font-size-medium);
    }

    .message-console {
      opacity: 0;
      transition: opacity $app-transition-base;
    }

    &:hover {
      .message-console {
        opacity: 1;
      }
    }
  }
}
</style>

<script setup lang="ts">
import ChatBody from '@renderer/components/chat/body/ChatBody.vue'
import ChatSidebar from '@renderer/components/chat/sidebar/ChatSidebar.vue'
import { useStore } from '@renderer/store/store'

// 仓库
const { chatSessionStore } = useStore()
</script>

<template>
  <div class="chat">
    <!-- 侧边栏 -->
    <ChatSidebar />

    <!-- 主体 -->
    <ChatBody
      v-if="chatSessionStore.getActiveSession"
      :key="chatSessionStore.getActiveSession.id"
    />
  </div>
</template>

<style lang="scss" scoped>
.chat {
  height: 100%;
  width: 100%;
  display: flex;
}
</style>

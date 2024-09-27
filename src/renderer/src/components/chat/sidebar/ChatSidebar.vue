<script setup lang="ts">
import ChatSidebarFooter from '@renderer/components/chat/sidebar/ChatSidebarFooter.vue'
import ChatSidebarHeader from '@renderer/components/chat/sidebar/ChatSidebarHeader.vue'
import ChatSidebarSessionList from '@renderer/components/chat/sidebar/ChatSidebarSessionList.vue'
import { useStore } from '@renderer/store/store'
import { ref } from 'vue'

// 仓库
const { appSettingStore } = useStore()

// ref
const sessionListRef = ref()
</script>

<template>
  <div
    class="chat-sidebar"
    :class="{ 'chat-sidebar-visible': appSettingStore.chat.sidebarVisible }"
  >
    <!-- 头部 -->
    <ChatSidebarHeader @create-session="sessionListRef.scrollToTop()" />

    <!-- 会话列表 -->
    <ChatSidebarSessionList ref="sessionListRef" />

    <!-- 底部 -->
    <ChatSidebarFooter />
  </div>
</template>

<style lang="scss" scoped>
.chat-sidebar {
  height: 100%;
  width: 0;
  overflow: hidden;
  background-color: var(--el-fill-color-light);
  transition: width $app-transition-base;
  display: flex;
  flex-direction: column;
  gap: $app-padding-small;

  &-visible {
    width: $app-chat-sidebar-width;
  }
}
</style>

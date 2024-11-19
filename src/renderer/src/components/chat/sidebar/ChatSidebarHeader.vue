<script setup lang="ts">
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import { useStore } from '@renderer/store/store'
import { copyObj } from '@renderer/utils/object-util'
import { onMounted, watch } from 'vue'

// 仓库
const { appSettingStore, chatSessionStore, appStateStore } = useStore()

// 定义事件
const emits = defineEmits(['create-session'])

// 创建会话
const createSession = () => {
  if (appStateStore.chatLoadingFlag) {
    return
  }
  chatSessionStore.create(
    copyObj({
      ...appSettingStore.openAI,
      memoryOption: appSettingStore.memoryOption,
      internetSearchOption: appSettingStore.internetSearchOption,
      calendarOption: appSettingStore.calendarOption
    })
  )
  emits('create-session')
}

// 监听当前激活会话
watch(
  () => chatSessionStore.activeSessionId,
  () => {
    // 如果没有当前会话，表示会话已经全部删除，自动创建会话
    if (!chatSessionStore.activeSessionId) {
      createSession()
    }
  }
)

onMounted(() => {
  // 创建初始会话
  if (chatSessionStore.sessions.length === 0) {
    createSession()
  }

  // 刷新状态Key，用于更具时间自动刷新组件
  appStateStore.startStateKeyInterval()
})
</script>

<template>
  <div class="chat-sidebar-header-container">
    <div
      class="sidebar-header"
      :class="{ 'sidebar-header-visible': appSettingStore.chat.sidebarVisible }"
    >
      <el-tooltip
        :content="
          appSettingStore.chat.sidebarVisible
            ? $t('app.chat.sidebar.header.close')
            : $t('app.chat.sidebar.header.open')
        "
      >
        <AppIcon
          name="menu"
          class="sidebar-menu-icon"
          @click="appSettingStore.chat.sidebarVisible = !appSettingStore.chat.sidebarVisible"
        />
      </el-tooltip>

      <el-tooltip :content="$t('app.chat.sidebar.header.newChat')">
        <AppIcon name="edit" class="session-create-icon" @click="createSession()" />
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-sidebar-header-container {
  height: $app-chat-sidebar-header-height;
  width: 100%;
  position: relative;

  .sidebar-header {
    height: $app-chat-sidebar-header-height;
    width: calc($app-icon-size-base * 2 + $app-padding-base * 3);
    transition: width $app-transition-base;
    box-sizing: border-box;
    padding: 0 $app-padding-base;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-visible {
      width: $app-chat-sidebar-width;
    }

    .sidebar-menu-icon {
      height: $app-icon-size-base;
      width: $app-icon-size-base;
      flex-shrink: 0;
      color: var(--el-text-color-regular);
      transition: color $app-transition-base;
      cursor: pointer;
      outline: none;

      &:hover {
        color: var(--el-text-color-primary);
      }
    }

    .session-create-icon {
      height: $app-icon-size-base;
      width: $app-icon-size-base;
      flex-shrink: 0;
      color: var(--el-text-color-regular);
      transition: color $app-transition-base;
      cursor: pointer;
      outline: none;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>

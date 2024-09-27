<script setup lang="ts">
import { MoreFilled } from '@element-plus/icons-vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import { useStore } from '@renderer/store/store'
import { nextTick, reactive, ref, toRefs } from 'vue'

// 仓库
const { chatSessionStore, appStateStore } = useStore()

// ref
const sessionNameInputRef = ref()

// 数据绑定
const data = reactive({
  mouseEnterFlag: false,
  moreDropdownVisible: false,
  sessionNameEditFlag: false
})
const { mouseEnterFlag, moreDropdownVisible, sessionNameEditFlag } = toRefs(data)

// 组件传参
const session = defineModel<ChatSession>('session', {
  default: () => {}
})

// 切换会话
const activeSession = () => {
  if (appStateStore.chatLoadingFlag) {
    return
  }
  chatSessionStore.activeSessionId = session.value.id!
}

// 归档会话
const archivedSession = () => {
  if (appStateStore.chatLoadingFlag) {
    return
  }
  chatSessionStore.archived(session.value.id!)
}

// 删除会话
const deleteSession = () => {
  data.mouseEnterFlag = false
  data.moreDropdownVisible = false
  if (appStateStore.chatLoadingFlag) {
    return
  }
  chatSessionStore.delete(session.value.id!)
}

// 修改会话名称
const editSession = () => {
  data.mouseEnterFlag = false
  data.moreDropdownVisible = false
  if (appStateStore.chatLoadingFlag) {
    return
  }
  data.sessionNameEditFlag = true
  nextTick(() => {
    sessionNameInputRef.value?.focus()
  })
}
</script>

<template>
  <div
    class="chat-session"
    :class="{ 'chat-session-active': chatSessionStore.activeSessionId === session.id }"
    @click="activeSession()"
    @mouseenter="mouseEnterFlag = true"
    @mouseleave="mouseEnterFlag = false"
  >
    <el-input
      v-if="sessionNameEditFlag"
      ref="sessionNameInputRef"
      v-model="session.name"
      class="session-name"
      @keydown.enter="sessionNameEditFlag = false"
      @blur="
        () => {
          sessionNameEditFlag = false
        }
      "
    />
    <div v-else class="session-name single-line-ellipsis">
      {{ session.name }}
    </div>

    <transition name="el-fade-in">
      <el-dropdown
        v-if="
          (chatSessionStore.activeSessionId === session.id ||
            moreDropdownVisible ||
            mouseEnterFlag) &&
          !sessionNameEditFlag
        "
        trigger="click"
        :disabled="appStateStore.chatLoadingFlag"
        :teleported="false"
        @visible-change="(visible: boolean) => (moreDropdownVisible = visible)"
      >
        <MoreFilled class="more-icon" @click.stop />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click.stop="editSession()">
              <el-space>
                <AppIcon name="rename" :size="18" />
                <div>{{ $t('app.chat.sidebar.session.more.editName') }}</div>
              </el-space>
            </el-dropdown-item>
            <el-dropdown-item @click.stop="archivedSession()">
              <el-space>
                <AppIcon name="archived" :size="18" />
                <div>{{ $t('app.chat.sidebar.session.more.archived') }}</div>
              </el-space>
            </el-dropdown-item>
            <el-dropdown-item @click.stop="deleteSession()">
              <el-space>
                <AppIcon name="delete" :size="18" />
                <div>{{ $t('app.chat.sidebar.session.more.delete') }}</div>
              </el-space>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.chat-session {
  height: $app-chat-sidebar-session-height;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: $app-padding-small;
  border-radius: $app-border-radius-base;
  color: var(--el-text-color-regular);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $app-transition-base;

  &:hover {
    background-color: var(--el-fill-color);
    color: var(--el-text-color-primary);
  }

  &-active {
    background-color: rgba(var(--el-color-primary-rgb), 0.1) !important;
    color: var(--el-color-primary) !important;
  }

  .session-name {
    min-width: 0;
    flex: 1 1 0;
  }

  .more-icon {
    height: $app-icon-size-small;
    width: $app-icon-size-small;
    padding-left: $app-padding-small;
    outline: none;
    transition: opacity $app-transition-base;
  }
}
</style>

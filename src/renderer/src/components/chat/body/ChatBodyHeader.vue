<script setup lang="ts">
import { Calendar, ChatDotSquare, Compass, Picture } from '@element-plus/icons-vue'
import ChatBodySetting from '@renderer/components/chat/body/ChatBodySetting.vue'
import ChatBodyStatistic from '@renderer/components/chat/body/ChatBodyStatistic.vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import { useStore } from '@renderer/store/store'
import { reactive, toRefs } from 'vue'

// 组件传参
const shareVisible = defineModel<boolean>('shareVisible', {
  default: () => false
})

// 数据绑定
const data = reactive({
  currentChatSettingVisible: false,
  currentChatStatisticVisible: false,
  activeTabName: ''
})
const { currentChatSettingVisible, currentChatStatisticVisible, activeTabName } = toRefs(data)

// 仓库
const { chatSessionStore, appSettingStore } = useStore()

const openSetting = (tabName = 'chat') => {
  if (!chatSessionStore.getActiveSession!.archived) {
    data.currentChatSettingVisible = true
    data.activeTabName = tabName
  }
}
</script>

<template>
  <div
    class="chat-body-header"
    :class="{
      'chat-body-header-sidebar-header-placeholder': !appSettingStore.chat.sidebarVisible
    }"
  >
    <el-tooltip :content="$t('app.chat.body.header.currentChat.setting')">
      <div class="model-name" @click="openSetting()">
        <div>{{ chatSessionStore.getActiveSession!.chatOption.model }}</div>
        <AppIcon name="arrow-down" class="model-name-icon" />
      </div>
    </el-tooltip>

    <div class="plugin-icon-list">
      <el-tooltip :content="$t('app.setting.textToImage')">
        <el-icon
          :class="{
            'plugin-icon-active': chatSessionStore.getActiveSession!.textToImageOption?.enabled
          }"
          @click="openSetting('textToImage')"
          ><Picture
        /></el-icon>
      </el-tooltip>
      <el-tooltip :content="$t('app.setting.memory')">
        <el-icon
          :class="{
            'plugin-icon-active': chatSessionStore.getActiveSession!.memoryOption?.enabled
          }"
          @click="openSetting('memory')"
          ><ChatDotSquare
        /></el-icon>
      </el-tooltip>
      <el-tooltip :content="$t('app.setting.internetSearch')">
        <el-icon
          :class="{
            'plugin-icon-active': chatSessionStore.getActiveSession!.internetSearchOption?.enabled
          }"
          @click="openSetting('internetSearch')"
          ><Compass
        /></el-icon>
      </el-tooltip>
      <el-tooltip :content="$t('app.setting.calendar')">
        <el-icon
          :class="{
            'plugin-icon-active':
              chatSessionStore.getActiveSession!.calendarOption?.queryEnabled ||
              chatSessionStore.getActiveSession!.calendarOption?.addEnabled
          }"
          @click="openSetting('calendar')"
          ><Calendar
        /></el-icon>
      </el-tooltip>
    </div>

    <template v-if="!shareVisible">
      <!-- 联网开关 -->
      <el-tooltip
        v-if="chatSessionStore.getActiveSession!.internetSearchOption"
        :content="
          chatSessionStore.getActiveSession!.internetSearchOption.enabled
            ? $t('app.chat.body.header.internetSearch.turnedOn')
            : $t('app.chat.body.header.internetSearch.turnedOff')
        "
        placement="bottom"
      >
        <AppIcon
          :name="
            chatSessionStore.getActiveSession!.internetSearchOption.enabled
              ? 'with-net'
              : 'without-net'
          "
          class="header-icon"
          @click="
            () => {
              if (!chatSessionStore.getActiveSession!.archived) {
                chatSessionStore.getActiveSession!.internetSearchOption.enabled =
                  !chatSessionStore.getActiveSession!.internetSearchOption.enabled
              }
            }
          "
        />
      </el-tooltip>

      <template v-if="!chatSessionStore.getActiveSession!.new">
        <!-- 分享按钮 -->
        <el-tooltip :content="$t('app.chat.body.header.share.title')">
          <AppIcon name="share" class="header-icon" @click="shareVisible = true" />
        </el-tooltip>

        <!-- 用量统计 -->
        <el-tooltip :content="$t('app.chat.body.statistic.title')">
          <AppIcon name="usage" class="header-icon" @click="currentChatStatisticVisible = true" />
        </el-tooltip>
      </template>
    </template>

    <!-- 取消分享 -->
    <el-button v-else link @click="shareVisible = false">
      {{ $t('app.chat.body.header.share.cancel') }}
    </el-button>

    <!-- 当前对话设置弹窗 -->
    <ChatBodySetting
      v-model:visible="currentChatSettingVisible"
      v-model:active-tab-name="activeTabName"
    />

    <!-- 当前对话统计弹窗 -->
    <ChatBodyStatistic v-model:visible="currentChatStatisticVisible" />
  </div>
</template>

<style lang="scss" scoped>
.chat-body-header {
  height: $app-chat-body-header-height;
  width: 100%;
  box-sizing: border-box;
  padding: 0 $app-padding-base;
  transition: padding-left $app-transition-base;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: $app-padding-base;

  &-sidebar-header-placeholder {
    padding-left: calc($app-icon-size-base * 2 + $app-padding-base * 3);
  }

  .model-name {
    display: flex;
    gap: $app-padding-extra-small;
    align-items: center;
    justify-content: center;
    font-size: $app-icon-size-small;
    font-weight: var(--el-font-weight-primary);
    color: var(--el-text-color-regular);
    transition: color $app-transition-base;
    cursor: pointer;

    &:hover {
      color: var(--el-text-color-primary);

      .model-name-icon {
        color: var(--el-text-color-primary);
      }
    }

    .model-name-icon {
      height: calc($app-icon-size-base - 4px);
      width: calc($app-icon-size-base - 4px);
      color: var(--el-text-color-secondary);
      transition: color $app-transition-base;
    }
  }

  .plugin-icon-list {
    margin-right: auto;
    display: flex;
    gap: $app-padding-base;
    cursor: pointer;
    color: var(--el-text-color-secondary);

    .plugin-icon-active {
      color: var(--el-text-color-primary);
    }
  }

  .header-icon {
    height: $app-icon-size-base;
    width: $app-icon-size-base;
    color: var(--el-text-color-regular);
    transition: color $app-transition-base;
    cursor: pointer;
    outline: none;

    &:hover {
      color: var(--el-text-color-primary);
    }
  }
}
</style>

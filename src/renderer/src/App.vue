<script setup lang="ts">
import Chat from '@renderer/components/chat/main/Chat.vue'
import TitleBar from '@renderer/components/title/TitleBar.vue'
import { useInit } from '@renderer/service/init-service'
import { useLocal } from '@renderer/service/local-service'
import { useTheme } from '@renderer/service/theme-service'
import { useTitle } from '@renderer/service/title-service'
import { getOperatingSystem } from '@renderer/utils/window-util'

// 主题切换
useTheme()

// 本地化
const { elementPlusLocale } = useLocal()

// 应用动态标题
useTitle()

// 应用初始化
useInit()
</script>

<template>
  <el-config-provider :locale="elementPlusLocale">
    <div class="app">
      <TitleBar v-if="getOperatingSystem().isMacOS" />
      <Chat class="chat" />
    </div>
  </el-config-provider>
</template>

<style lang="scss" scoped>
.app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--el-bg-color);
  display: flex;
  flex-direction: column;

  .chat {
    min-height: 0;
    flex: 1 1 0;
  }
}
</style>

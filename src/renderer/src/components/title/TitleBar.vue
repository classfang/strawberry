<script setup lang="ts">
import { AppConfig } from '@renderer/config/AppConfig'
import { useStore } from '@renderer/store/store'

// 仓库
const { chatSessionStore } = useStore()
</script>

<template>
  <div class="title-bar drag-area">
    <div class="title single-line-ellipsis">
      {{ chatSessionStore.getActiveSession?.name || AppConfig.name }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title-bar {
  height: $app-title-bar-height;
  width: 100%;
  background-color: var(--el-fill-color-dark);
  display: flex;
  align-items: center;
  justify-content: center;

  .title {
    min-width: 0;
    max-width: 60%;
    flex: 1 1 0;
    font-size: var(--el-font-size-small);
    text-align: center;
    font-weight: var(--el-font-weight-primary);
  }
}
</style>

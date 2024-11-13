<script setup lang="ts">
import { AppConfig } from '@renderer/config/AppConfig'
import { useStore } from '@renderer/store/store'

// 仓库
const { chatSessionStore, appStateStore } = useStore()
</script>

<template>
  <div class="title-bar drag-area">
    <div class="title single-line-ellipsis">
      <template v-if="appStateStore.chatLoadingFlag">
        <span v-if="appStateStore.chatAnswerFlag" class="title-state-answering">
          {{ $t('app.state.answering') }}
        </span>
        <span v-else class="title-state-wait">
          {{ $t('app.state.waitAnswer') }}
        </span>
      </template>
      <span v-else>
        {{ chatSessionStore.getActiveSession?.name || AppConfig.name }}
      </span>
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

    @keyframes alternate-breathing {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .title-state-wait {
      animation: alternate-breathing 1200ms ease-in-out infinite;
    }

    .title-state-answering {
      animation: alternate-breathing 800ms ease-in-out infinite;
    }
  }
}
</style>

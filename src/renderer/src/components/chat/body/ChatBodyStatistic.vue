<script setup lang="ts">
import { useStore } from '@renderer/store/store'

// 仓库
const { chatSessionStore } = useStore()

// 组件传参
const visible = defineModel<boolean>('visible', {
  default: () => false
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="$t('app.chat.body.statistic.title')"
    width="700"
    align-center
  >
    <div class="dialog-body">
      <div class="token-statistic">
        <el-statistic
          :title="$t('app.chat.body.statistic.promptTokens')"
          :value="chatSessionStore.getActiveSession!.usage?.promptTokens"
        />
        <el-statistic
          :title="$t('app.chat.body.statistic.completionTokens')"
          :value="chatSessionStore.getActiveSession!.usage?.completionTokens"
        />
        <el-statistic
          :title="$t('app.chat.body.statistic.totalTokens')"
          :value="chatSessionStore.getActiveSession!.usage?.totalTokens"
        />
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-body {
  height: $app-dialog-height;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;

  .token-statistic {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    gap: $app-padding-base;

    :deep(.el-statistic) {
      flex-shrink: 0;
      text-align: center;

      .el-statistic__head {
        font-size: var(--el-font-size);
      }
    }
  }
}
</style>

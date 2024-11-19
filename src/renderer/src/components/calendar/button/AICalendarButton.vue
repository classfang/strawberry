<script setup lang="ts">
import AICalendar from '@renderer/components/calendar/main/AICalendar.vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import { useStore } from '@renderer/store/store'
import { reactive, toRefs } from 'vue'

// 仓库
const { appStateStore } = useStore()

// 数据绑定
const data = reactive({
  drawerVisible: false
})
const { drawerVisible } = toRefs(data)
</script>

<template>
  <div>
    <el-tooltip :content="$t('app.calendar.title')">
      <AppIcon name="more" class="ai-calendar-button-icon" @click="drawerVisible = true" />
    </el-tooltip>
    <AICalendar
      v-model:drawerVisible="drawerVisible"
      :key="`ai-calendar-${appStateStore.dayKey}`"
    />
  </div>
</template>

<style lang="scss">
.ai-calendar-button-icon {
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

.ai-calendar-drawer {
  border-radius: $app-border-radius-base $app-border-radius-base 0 0;

  .el-drawer__header {
    margin-bottom: 0;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: $app-padding-base;

    .drawer-header-title {
      font-size: var(--el-font-size-medium);
    }
  }
}

.starred-list {
  width: $app-dialog-height;
  height: $app-dialog-height;

  .starred-list-empty {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
  }
}
</style>

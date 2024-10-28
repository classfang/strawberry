<script setup lang="ts">
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import MorePage from '@renderer/components/more/main/MorePage.vue'
</script>

<template>
  <el-popover
    placement="right-end"
    width="auto"
    trigger="click"
    popper-class="more-button-popover"
    :hide-after="0"
  >
    <template #reference>
      <AppIcon name="more" class="more-icon" />
    </template>
    <MorePage />
  </el-popover>
</template>

<style scoped lang="scss">
.more-icon {
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
</style>

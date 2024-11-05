<script setup lang="ts">
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import MorePage from '@renderer/components/more/main/MorePage.vue'
import { reactive, toRefs } from 'vue'

// 数据绑定
const data = reactive({
  drawerVisible: false
})
const { drawerVisible } = toRefs(data)
</script>

<template>
  <div>
    <AppIcon name="more" class="more-icon" @click="drawerVisible = true" />
    <el-drawer
      v-model="drawerVisible"
      size="90%"
      direction="btt"
      class="more-page-drawer"
      :title="$t('app.more.title')"
      append-to-body
    >
      <MorePage />
    </el-drawer>
  </div>
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

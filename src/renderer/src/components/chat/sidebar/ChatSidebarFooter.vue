<script setup lang="ts">
import MoreButton from '@renderer/components/more/button/MoreButton.vue'
import AppSetting from '@renderer/components/setting/AppSetting.vue'
</script>

<template>
  <div class="chat-sidebar-footer-container">
    <AppSetting />
    <MoreButton />
  </div>
</template>

<style lang="scss" scoped>
.chat-sidebar-footer-container {
  height: $app-chat-sidebar-footer-height;
  width: 100%;
  box-sizing: border-box;
  padding: 0 $app-padding-base;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

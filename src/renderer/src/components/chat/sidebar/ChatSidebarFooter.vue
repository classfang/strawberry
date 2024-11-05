<script setup lang="ts">
import AICalendarButton from '@renderer/components/calendar/button/AICalendarButton.vue'
import AppSetting from '@renderer/components/setting/AppSetting.vue'
</script>

<template>
  <div class="chat-sidebar-footer-container">
    <div class="chat-sidebar-footer">
      <AppSetting />
      <AICalendarButton />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-sidebar-footer-container {
  height: $app-chat-sidebar-footer-height;
  width: 100%;
  overflow: hidden;

  .chat-sidebar-footer {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    padding: 0 $app-padding-base;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

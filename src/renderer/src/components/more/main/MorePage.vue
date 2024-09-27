<script setup lang="ts">
import AICalendarButton from '@renderer/components/calendar/button/AICalendarButton.vue'
import NewsButton from '@renderer/components/news/button/NewsButton.vue'
</script>

<template>
  <div class="more-page">
    <div class="more-page-title">{{ $t('app.more.title') }}</div>
    <div class="more-page-body">
      <AICalendarButton />
      <NewsButton />
    </div>
  </div>
</template>

<style scoped lang="scss">
.more-page {
  width: 100%;
  margin: $app-padding-extra-small;
  display: flex;
  flex-direction: column;
  gap: $app-padding-base;

  .more-page-title {
    font-size: var(--el-font-size-base);
    color: var(--el-color-primary);
  }

  .more-page-body {
    width: 100%;
    display: flex;
    align-items: center;
    gap: $app-padding-base;
    flex-wrap: wrap;
  }
}
</style>

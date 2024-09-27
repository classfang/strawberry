<script setup lang="ts">
import { Reading } from '@element-plus/icons-vue'
import NewsPage from '@renderer/components/news/main/NewsPage.vue'
import { reactive, toRefs } from 'vue'

// 数据绑定
const data = reactive({
  drawerVisible: false
})
const { drawerVisible } = toRefs(data)
</script>

<template>
  <div>
    <el-button :icon="Reading" plain size="small" @click="drawerVisible = true">
      <div>{{ $t('app.news.title') }}</div>
    </el-button>
    <el-drawer
      v-model="drawerVisible"
      :title="$t('app.news.title')"
      size="90%"
      direction="btt"
      class="news-page-drawer"
      destroy-on-close
      append-to-body
    >
      <NewsPage />
    </el-drawer>
  </div>
</template>

<style lang="scss">
.news-page-drawer {
  border-radius: $app-border-radius-base $app-border-radius-base 0 0;

  .el-drawer__header {
    margin-bottom: 0;
  }
}
</style>

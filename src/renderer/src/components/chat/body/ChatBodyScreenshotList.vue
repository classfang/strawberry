<script setup lang="ts">
import { Monitor } from '@element-plus/icons-vue'
import i18n from '@renderer/i18n'
import { getDesktopScreenshots } from '@renderer/service/ipc-service'
import { Logger } from '@renderer/service/logger-service'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, toRefs } from 'vue'

// 多语言
const { t } = i18n.global

// 数据绑定
const data = reactive({
  loading: false,
  screenshotList: [] as DesktopScreenshot[]
})
const { loading, screenshotList } = toRefs(data)

// 定义事件
const emits = defineEmits(['select-screenshot'])

// 挂载完毕（配合 el-dialog 的 destroy-on-close）
onMounted(() => {
  data.loading = true
  // 获取屏幕截图
  getDesktopScreenshots()
    .then((sources) => {
      data.screenshotList = sources
    })
    .catch((error: any) => {
      ElMessage.error(t('app.chat.body.screenshot.error'))
      Logger.error('openScreenshotsDialog error: ', error.message)
    })
    .finally(() => {
      data.loading = false
    })
})
</script>

<template>
  <div class="chat-screenshot-list">
    <el-table
      v-loading="loading"
      class="screenshot-table"
      :data="screenshotList"
      :show-header="false"
      height="100%"
    >
      <el-table-column>
        <template #default="scope">
          <el-popover placement="right" trigger="hover" :show-after="500" :hide-after="0">
            <template #reference>
              <div class="screenshot-item" @click="emits('select-screenshot', scope.row)">
                <img
                  v-if="scope.row.appIcon"
                  class="screenshot-item-icon"
                  :src="scope.row.appIcon"
                  alt=""
                />
                <Monitor v-else class="screenshot-item-icon" />
                <el-text class="screenshot-item-name" line-clamp="1">
                  {{ scope.row.name }}
                </el-text>
              </div>
            </template>
            <template #default>
              <el-image :src="scope.row.thumbnail" />
            </template>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.chat-screenshot-list {
  height: $app-dialog-height;

  .screenshot-table {
    .screenshot-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: $app-padding-base;

      .screenshot-item-icon {
        height: $app-icon-size-base;
        width: $app-icon-size-base;
      }

      .screenshot-item-name {
        min-width: 0;
        flex: 1 1 0;
      }
    }
  }
}
</style>

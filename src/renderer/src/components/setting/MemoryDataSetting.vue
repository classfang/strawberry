<script setup lang="ts">
import { Brush, ChatDotSquare } from '@element-plus/icons-vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import i18n from '@renderer/i18n'
import { useStore } from '@renderer/store/store'
import { ElMessageBox } from 'element-plus'
import { reactive, toRefs } from 'vue'

// 多语言
const { t } = i18n.global

// 仓库
const { chatMemoryStore } = useStore()

// 数据绑定
const data = reactive({
  dialogVisible: false
})
const { dialogVisible } = toRefs(data)

// 删除
const deleteMemory = (id: string) => {
  ElMessageBox.confirm(
    t('app.setting.item.memory.deleteConfirm'),
    t('app.setting.item.memory.delete'),
    {
      distinguishCancelAndClose: true,
      confirmButtonText: t('app.common.confirm'),
      cancelButtonText: t('app.common.cancel')
    }
  ).then(() => {
    chatMemoryStore.deleteById(id)
  })
}

// 清空
const clearMemory = () => {
  ElMessageBox.confirm(
    t('app.setting.item.memory.clearConfirm'),
    t('app.setting.item.memory.clear'),
    {
      distinguishCancelAndClose: true,
      confirmButtonText: t('app.common.confirm'),
      cancelButtonText: t('app.common.cancel')
    }
  ).then(() => {
    chatMemoryStore.clear()
  })
}
</script>

<template>
  <el-button :icon="ChatDotSquare" @click="dialogVisible = true">
    {{ $t('app.setting.item.memory.manage') }}
  </el-button>

  <el-dialog
    v-model="dialogVisible"
    :title="$t('app.setting.item.memory.manage')"
    width="700"
    align-center
  >
    <div class="dialog-body">
      <el-table class="memory-table" :data="chatMemoryStore.memoryList" height="100%">
        <el-table-column>
          <template #header>
            <div class="memory-table-header">
              <div>
                {{
                  $t('app.setting.item.memory.count').replace(
                    '_',
                    String(chatMemoryStore.memoryList.length)
                  )
                }}
              </div>
              <el-button plain type="danger" :icon="Brush" @click="clearMemory()">
                {{ $t('app.setting.item.memory.clear') }}
              </el-button>
            </div>
          </template>
          <template #default="scope">
            <div class="memory-item">
              <div class="memory-item-content">{{ scope.row.content }}</div>
              <AppIcon
                class="memory-item-delete-icon"
                name="delete"
                @click="deleteMemory(scope.row.id)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-body {
  height: $app-dialog-height;

  .memory-table {
    .memory-table-header {
      display: flex;
      gap: $app-padding-small;
      align-items: center;
      justify-content: space-between;
    }

    .memory-item {
      display: flex;
      gap: $app-padding-small;
      align-items: center;
      justify-content: space-between;

      .memory-item-content {
        min-width: 0;
        flex: 1 1 0;
      }

      .memory-item-delete-icon {
        height: $app-icon-size-small;
        width: $app-icon-size-small;
        cursor: pointer;
        color: var(--el-text-color-regular);
        transition: color $app-transition-base;

        &:hover {
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}
</style>

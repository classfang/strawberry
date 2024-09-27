<script setup lang="ts">
import { ChatRound, Search } from '@element-plus/icons-vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import i18n from '@renderer/i18n'
import { useStore } from '@renderer/store/store'
import { ElMessageBox } from 'element-plus'
import { reactive, toRefs } from 'vue'

// 多语言
const { t } = i18n.global

// 仓库
const { appStateStore, chatSessionStore } = useStore()

// 数据绑定
const data = reactive({
  archivedKeyword: ''
})
const { archivedKeyword } = toRefs(data)

// 预览归档
const previewArchived = (id: string) => {
  chatSessionStore.activeSessionId = id
  appStateStore.archivedDataDialogVisible = false
  appStateStore.appSettingDialogVisible = false
}

// 取消归档
const unarchived = (id: string) => {
  chatSessionStore.unarchived(id)
}

// 删除
const deleteArchived = (id: string) => {
  ElMessageBox.confirm(
    t('app.setting.item.data.deleteArchivedConfirm'),
    t('app.setting.item.data.deleteArchived'),
    {
      distinguishCancelAndClose: true,
      confirmButtonText: t('app.common.confirm'),
      cancelButtonText: t('app.common.cancel')
    }
  ).then(() => {
    chatSessionStore.delete(id)
  })
}
</script>

<template>
  <el-button :icon="ChatRound" @click="appStateStore.archivedDataDialogVisible = true">
    {{ $t('app.setting.item.data.archivedManage') }}
  </el-button>

  <el-dialog
    v-model="appStateStore.archivedDataDialogVisible"
    :title="$t('app.setting.item.data.archivedManage')"
    width="700"
    align-center
  >
    <div class="dialog-body">
      <el-table
        class="archived-table"
        :data="
          chatSessionStore.getArchivedSessions.filter(
            (session) =>
              session.name.includes(archivedKeyword) ||
              session.messages.findIndex((m) => m.content.includes(archivedKeyword)) > -1
          )
        "
        height="100%"
      >
        <el-table-column>
          <template #header>
            <div class="archived-table-header">
              <div class="archived-count">
                {{
                  $t('app.setting.item.data.archivedCount').replace(
                    '_',
                    String(
                      chatSessionStore.getArchivedSessions.filter(
                        (session) =>
                          session.name.includes(archivedKeyword) ||
                          session.messages.findIndex((m) => m.content.includes(archivedKeyword)) >
                            -1
                      ).length
                    )
                  )
                }}
              </div>
              <div class="archived-search">
                <el-input
                  v-model="archivedKeyword"
                  :placeholder="$t('app.common.search')"
                  :prefix-icon="Search"
                />
              </div>
            </div>
          </template>
          <template #default="scope">
            <div class="archived-item">
              <div class="archived-item-content" @click="previewArchived(scope.row.id)">
                {{ scope.row.name }}
              </div>
              <el-space>
                <AppIcon
                  class="archived-item-icon"
                  name="unarchived"
                  @click="unarchived(scope.row.id)"
                />
                <AppIcon
                  class="archived-item-icon"
                  name="delete"
                  @click="deleteArchived(scope.row.id)"
                />
              </el-space>
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

  .archived-table {
    .archived-table-header {
      display: flex;
      gap: $app-padding-small;
      align-items: center;
      justify-content: space-between;

      .archived-search {
        width: 400px;
      }

      .archived-count {
        font-weight: var(--el-font-weight-primary);
      }
    }

    .archived-item {
      display: flex;
      gap: $app-padding-small;
      align-items: center;
      justify-content: space-between;

      .archived-item-content {
        min-width: 0;
        flex: 1 1 0;
        color: var(--el-color-primary);
      }

      .archived-item-icon {
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

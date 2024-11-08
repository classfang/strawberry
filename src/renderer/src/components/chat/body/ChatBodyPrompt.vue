<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import prompts from '@renderer/assets/json/prompts.json'
import { useStore } from '@renderer/store/store'
import { getRandomElements } from '@renderer/utils/array-util'
import { computed, reactive, toRefs } from 'vue'

// 仓库
const { appSettingStore } = useStore()

// 事件
const emits = defineEmits(['use-prompt'])

// 数据绑定
const data = reactive({
  dialogVisible: false,
  promptKeyword: ''
})
const { dialogVisible, promptKeyword } = toRefs(data)

// 计算属性
const randomPrompts = computed(() => getRandomElements(prompts[appSettingStore.app.locale], 5))
</script>

<template>
  <div class="chat-body-prompt">
    <div
      v-for="p in randomPrompts"
      :key="p[0]"
      class="fast-prompt-item"
      @click="emits('use-prompt', p[1])"
    >
      <div class="fast-prompt-item-title">{{ p[0] }}</div>
      <el-text class="fast-prompt-item-content" line-clamp="1">
        {{ p[1] }}
      </el-text>
    </div>
    <div class="fast-prompt-item" @click="dialogVisible = true">
      <div class="fast-prompt-item-title">{{ $t('app.chat.body.prompt.more.title') }}</div>
      <el-text class="fast-prompt-item-content" line-clamp="1">
        {{ $t('app.chat.body.prompt.more.content') }}
      </el-text>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="$t('app.chat.body.prompt.title')"
      width="700"
      align-center
    >
      <div class="dialog-body">
        <el-table
          class="prompt-table"
          :data="
            (prompts[appSettingStore.app.locale] as string[]).filter(
              (p) => p[0].includes(promptKeyword) || p[1].includes(promptKeyword)
            )
          "
          height="100%"
        >
          <el-table-column>
            <template #header>
              <div class="prompt-table-header">
                <div class="prompt-count">
                  {{
                    $t('app.chat.body.prompt.count').replace(
                      '_',
                      String(
                        (prompts[appSettingStore.app.locale] as string[][]).filter(
                          (p) => p[0].includes(promptKeyword) || p[0].includes(promptKeyword)
                        ).length
                      )
                    )
                  }}
                </div>
                <div class="prompt-search">
                  <el-input
                    v-model="promptKeyword"
                    :placeholder="$t('app.common.search')"
                    :prefix-icon="Search"
                  />
                </div>
              </div>
            </template>
            <template #default="scope">
              <div
                class="prompt-item"
                @click="
                  () => {
                    dialogVisible = false
                    emits('use-prompt', scope.row[1])
                  }
                "
              >
                <div class="prompt-item-title">{{ scope.row[0] }}</div>
                <el-text class="prompt-item-content" line-clamp="1">{{ scope.row[1] }}</el-text>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.chat-body-prompt {
  width: 100%;
  box-sizing: border-box;
  padding: 0 $app-padding-large;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $app-padding-base;

  .fast-prompt-item {
    box-sizing: border-box;
    padding: $app-padding-small;
    border-radius: $app-border-radius-base;
    border: 1px solid var(--el-fill-color-darker);
    cursor: pointer;
    transition: all $app-transition-fast;
    display: flex;
    flex-direction: column;
    gap: $app-padding-small;

    &:hover {
      border: 1px solid var(--el-color-primary);
    }

    .fast-prompt-item-title {
      color: var(--el-text-color-primary);
      font-weight: var(--el-font-weight-primary);
    }

    .fast-prompt-item-content {
      color: var(--el-text-color-secondary);
      align-self: flex-start;
    }
  }

  .dialog-body {
    height: $app-dialog-height;

    .prompt-table {
      .prompt-table-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .prompt-search {
          width: 400px;
        }

        .prompt-count {
          font-weight: var(--el-font-weight-primary);
        }
      }

      .prompt-item {
        .prompt-item-title {
          font-weight: var(--el-font-weight-primary);
        }

        .prompt-item-content {
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>

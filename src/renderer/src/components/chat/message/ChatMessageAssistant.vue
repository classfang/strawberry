<script setup lang="ts">
import { Download } from '@element-plus/icons-vue'
import '@renderer/assets/css/markdown-body.scss'
import ChatMessageConsole from '@renderer/components/chat/message/ChatMessageConsole.vue'
import { useStore } from '@renderer/store/store'
import { downloadFile } from '@renderer/utils/download-util'
import { renderMarkdown } from '@renderer/utils/markdown-util'
import { join } from '@renderer/utils/path-util'
import { openInBrowser } from '@renderer/utils/window-util'

// 仓库
const { appStateStore, chatSessionStore } = useStore()

// 定义事件
const emits = defineEmits(['regenerate', 'clear-context'])

// 组件传参
defineProps({
  hasConsole: {
    type: Boolean,
    default: true
  }
})
const message = defineModel<ChatMessage>('message', {
  default: () => {}
})
</script>

<template>
  <div class="chat-message-assistant">
    <div class="message-content-container">
      <div class="message-content">
        <!-- 搜索结果列表 -->
        <el-collapse
          v-if="message.searchItems && message.searchItems.length > 0"
          class="search-item-list-collapse"
        >
          <el-collapse-item
            :title="`${$t('app.chat.body.message.searchResult').replace('_', String(message.searchItems.length))}`"
          >
            <div class="search-item-list">
              <template v-for="item in message.searchItems" :key="item.link">
                <div class="search-item" @click="openInBrowser(item.link)">
                  <el-text class="search-item-title" line-clamp="1">
                    {{ item.title }}
                  </el-text>
                  <div class="search-item-display-link">{{ item.displayLink }}</div>
                </div>
              </template>
            </div>
          </el-collapse-item>
        </el-collapse>

        <!-- Markdown内容 -->
        <div
          class="markdown-body select-text"
          v-html="
            renderMarkdown(
              message.content,
              chatSessionStore.getActiveSession?.messages.at(-1)?.id === message.id &&
                appStateStore.chatLoadingFlag,
              appStateStore.chatSearchingFlag
            )
          "
        ></div>

        <!-- 图片列表 -->
        <div v-if="message.images && message.images.length > 0" class="attachment-list">
          <template v-for="(att, index) in message.images" :key="att.saveName">
            <el-dropdown trigger="contextmenu">
              <div class="image-item hover-float-up">
                <el-image
                  class="item-image"
                  :src="`file://${join(appStateStore.cachePath, att.saveName)}`"
                  :preview-src-list="
                    message.images.map((a) => `file://${join(appStateStore.cachePath, a.saveName)}`)
                  "
                  :initial-index="index"
                  fit="cover"
                />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :icon="Download"
                    @click="
                      downloadFile(
                        `file://${join(appStateStore.cachePath, att.saveName)}`,
                        att.name
                      )
                    "
                    >{{ $t('app.chat.body.message.download') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>

      <ChatMessageConsole
        v-if="hasConsole"
        v-model:message="message"
        class="message-console"
        @regenerate="emits('regenerate')"
        @clear-context="emits('clear-context')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-message-assistant {
  width: 100%;
  flex: 1 1 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: $app-padding-small;

  .message-content-container {
    min-width: 0;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $app-padding-extra-small;

    .message-content {
      min-width: calc($app-line-height-large + $app-padding-base * 2);
      max-width: 90%;
      flex: 1 1 0;
      background-color: var(--el-fill-color-light);
      box-sizing: border-box;
      padding: $app-padding-small $app-padding-base;
      border-radius: $app-border-radius-base;
      display: flex;
      flex-direction: column;
      gap: $app-padding-small;
      font-size: var(--el-font-size-medium);

      .attachment-list {
        display: flex;
        gap: $app-padding-small;
        flex-wrap: wrap;

        .image-item {
          height: $app-chat-message-image-height;
          width: $app-chat-message-image-height;
          position: relative;
          cursor: pointer;

          .item-image {
            height: 100%;
            width: 100%;
            border-radius: $app-border-radius-base;
          }
        }
      }

      .search-item-list-collapse {
        border: none;

        :deep(.el-collapse-item__header) {
          height: calc($app-line-height-base + $app-padding-small);
          padding-bottom: $app-padding-small;
          background-color: transparent;
          font-size: var(--el-font-size-base);
          color: var(--el-text-color-primary);
        }

        :deep(.el-collapse-item__wrap) {
          background-color: transparent;
        }

        .search-item-list {
          display: flex;
          flex-direction: column;
          gap: $app-padding-extra-small;
          font-size: var(--el-font-size-base);

          .search-item {
            width: 100%;
            cursor: pointer;
            transition: color $app-transition-base;
            display: flex;
            align-items: center;
            gap: $app-padding-small;

            &:hover {
              color: var(--el-color-primary);

              .search-item-title {
                color: var(--el-color-primary);
              }
            }

            .search-item-title {
              min-width: 0;
              max-width: max-content;
              flex: 1 1 0;
              transition: color $app-transition-base;
            }

            .search-item-display-link {
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }

    .message-console {
      opacity: 0;
      transition: opacity $app-transition-base;
    }

    &:hover {
      .message-console {
        opacity: 1;
      }
    }
  }
}
</style>

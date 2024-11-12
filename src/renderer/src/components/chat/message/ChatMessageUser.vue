<script setup lang="ts">
import { Download } from '@element-plus/icons-vue'
import ChatMessageConsole from '@renderer/components/chat/message/ChatMessageConsole.vue'
import AppIcon from '@renderer/components/icon/AppIcon.vue'
import FileIcon from '@renderer/components/icon/FileIcon.vue'
import { showItemInFolder } from '@renderer/service/ipc-service'
import { useStore } from '@renderer/store/store'
import { downloadFile } from '@renderer/utils/download-util'
import { formatFileSize } from '@renderer/utils/file-util'
import { join } from '@renderer/utils/path-util'
import { openInBrowser } from '@renderer/utils/window-util'

// 仓库
const { appStateStore } = useStore()

// 组件传参
const message = defineModel<ChatMessage>('message', {
  default: () => {}
})

// 定义事件
const emits = defineEmits(['clear-context'])
</script>

<template>
  <div class="chat-message-user">
    <div class="message-content select-text">
      <!-- 文本内容 -->
      <span>{{ message.content }}</span>

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
                    downloadFile(`file://${join(appStateStore.cachePath, att.saveName)}`, att.name)
                  "
                  >{{ $t('app.chat.body.message.download') }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>

      <!-- 文件列表 -->
      <div v-if="message.files && message.files.length > 0" class="attachment-list">
        <template v-for="att in message.files" :key="att.saveName">
          <el-dropdown trigger="contextmenu">
            <div
              class="file-item hover-float-up"
              @click="showItemInFolder(join(appStateStore.cachePath, att.saveName))"
            >
              <FileIcon class="file-icon" :extname="att.extname.toLowerCase()" />
              <div class="file-item-body">
                <div class="file-item-name">{{ att.name }}</div>
                <div class="file-item-size">{{ formatFileSize(att.size) }}</div>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :icon="Download"
                  @click="
                    downloadFile(`file://${join(appStateStore.cachePath, att.saveName)}`, att.name)
                  "
                  >{{ $t('app.chat.body.message.download') }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>

      <!-- 链接列表 -->
      <div v-if="message.links && message.links.length > 0" class="attachment-list">
        <template v-for="att in message.links" :key="att.url">
          <div class="link-item hover-float-up" @click="openInBrowser(att.url)">
            <AppIcon class="link-icon" name="with-net" />
            <div class="link-item-body">
              <div class="link-item-name">{{ att.url }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <ChatMessageConsole
      v-model:message="message"
      class="message-console"
      @clear-context="emits('clear-context')"
    />
  </div>
</template>

<style lang="scss" scoped>
.chat-message-user {
  width: 100%;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: $app-padding-extra-small;

  .message-content {
    min-width: calc($app-line-height-large + $app-padding-base * 2);
    max-width: 90%;
    flex: 1 1 0;
    white-space: pre-wrap;
    line-break: anywhere;
    background-color: var(--el-fill-color-light);
    box-sizing: border-box;
    padding: $app-padding-small $app-padding-base;
    border-radius: $app-border-radius-base;
    line-height: $app-line-height-large;
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

      .file-item {
        height: $app-chat-message-file-height;
        max-width: 100%;
        box-sizing: border-box;
        padding: $app-padding-small;
        background-color: var(--el-fill-color-darker);
        border-radius: $app-border-radius-base;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $app-padding-extra-small;
        cursor: pointer;

        .file-icon {
          flex-shrink: 0;
          height: 100%;
        }

        .file-item-body {
          height: 100%;
          min-width: 0;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .file-item-name {
            font-size: var(--el-font-size-base);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .file-item-size {
            font-size: var(--el-font-size-small);
            color: var(--el-text-color-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .link-item {
        height: calc($app-line-height-base + $app-padding-small * 2);
        max-width: 100%;
        box-sizing: border-box;
        padding: $app-padding-small;
        background-color: var(--el-fill-color-darker);
        border-radius: $app-border-radius-base;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $app-padding-extra-small;
        cursor: pointer;

        .link-icon {
          flex-shrink: 0;
          height: 100%;
        }

        .link-item-body {
          height: 100%;
          min-width: 0;
          flex-grow: 1;

          .link-item-name {
            line-height: $app-line-height-base;
            font-size: var(--el-font-size-base);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  .message-console {
    opacity: 0;
    transition: opacity $app-transition-base;
    justify-content: flex-end;
  }

  &:hover {
    .message-console {
      opacity: 1;
    }
  }
}
</style>

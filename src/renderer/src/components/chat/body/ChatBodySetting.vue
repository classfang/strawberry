<script setup lang="ts">
import {
  Calendar,
  ChatDotSquare,
  ChatLineSquare,
  Compass,
  Microphone,
  Picture
} from '@element-plus/icons-vue'
import MemoryDataSetting from '@renderer/components/setting/MemoryDataSetting.vue'
import {
  OpenAIImageModelDallE3,
  OpenAIImageModels,
  OpenAIImageSizes,
  OpenAIModels,
  OpenAISpeechModels,
  OpenAISpeechVoices
} from '@renderer/config/OpenAIConfig'
import { useStore } from '@renderer/store/store'

// 仓库
const { chatSessionStore } = useStore()

// 组件传参
const visible = defineModel<boolean>('visible', {
  default: () => false
})
const activeTabName = defineModel<string>('activeTabName', {
  default: () => 'chat'
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="$t('app.chat.body.header.currentChat.setting')"
    width="700"
    align-center
  >
    <div class="dialog-body">
      <el-tabs v-model="activeTabName" tab-position="left">
        <!-- 对话 -->
        <el-tab-pane name="chat">
          <template #label>
            <div class="setting-item-label">
              <el-icon><ChatLineSquare /></el-icon>
              <span>{{ $t('app.setting.chat') }}</span>
            </div>
          </template>
          <el-form label-width="auto" label-position="left">
            <!-- Model -->
            <el-form-item :label="$t('app.setting.item.chat.model')">
              <el-select
                v-model="chatSessionStore.getActiveSession!.chatOption.model"
                allow-create
                filterable
              >
                <el-option-group
                  v-for="group in OpenAIModels"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-option-group>
              </el-select>
            </el-form-item>

            <!-- Temperature -->
            <el-form-item :label="$t('app.setting.item.chat.temperature')">
              <el-tooltip
                :content="$t('app.setting.item.chat.explain.temperature')"
                placement="right"
              >
                <el-input-number
                  v-model="chatSessionStore.getActiveSession!.chatOption.temperature"
                  :min="0"
                  :max="1"
                  :step="0.1"
                />
              </el-tooltip>
            </el-form-item>

            <!-- Top P -->
            <el-form-item :label="$t('app.setting.item.chat.topP')">
              <el-tooltip :content="$t('app.setting.item.chat.explain.topP')" placement="right">
                <el-input-number
                  v-model="chatSessionStore.getActiveSession!.chatOption.topP"
                  :min="0"
                  :max="1"
                  :step="0.1"
                />
              </el-tooltip>
            </el-form-item>

            <!-- Max Tokens -->
            <el-form-item :label="$t('app.setting.item.chat.maxCompletionTokens')">
              <el-tooltip
                :content="$t('app.setting.item.chat.explain.maxCompletionTokens')"
                placement="right"
              >
                <el-input-number
                  v-model="chatSessionStore.getActiveSession!.chatOption.maxCompletionTokens"
                  :min="1024"
                  :max="1024000"
                  :step="1"
                />
              </el-tooltip>
            </el-form-item>

            <!-- Presence Penalty -->
            <el-form-item :label="$t('app.setting.item.chat.presencePenalty')">
              <el-tooltip
                :content="$t('app.setting.item.chat.explain.presencePenalty')"
                placement="right"
              >
                <el-input-number
                  v-model="chatSessionStore.getActiveSession!.chatOption.presencePenalty"
                  :min="-2"
                  :max="2"
                  :step="0.1"
                />
              </el-tooltip>
            </el-form-item>

            <!-- Frequency Penalty -->
            <el-form-item :label="$t('app.setting.item.chat.frequencyPenalty')">
              <el-tooltip
                :content="$t('app.setting.item.chat.explain.frequencyPenalty')"
                placement="right"
              >
                <el-input-number
                  v-model="chatSessionStore.getActiveSession!.chatOption.frequencyPenalty"
                  :min="-2"
                  :max="2"
                  :step="0.1"
                />
              </el-tooltip>
            </el-form-item>

            <!-- Context Size -->
            <el-form-item :label="$t('app.setting.item.chat.contextSize')">
              <el-tooltip
                :content="$t('app.setting.item.chat.explain.contextSize')"
                placement="right"
              >
                <el-input-number
                  v-model="chatSessionStore.getActiveSession!.chatOption.contextSize"
                  :min="0"
                  :max="100"
                  :step="1"
                />
              </el-tooltip>
            </el-form-item>

            <!-- Auto Generate Title -->
            <el-form-item :label="$t('app.setting.item.chat.autoGenerateSessionName')">
              <el-tooltip
                :content="$t('app.setting.item.chat.explain.autoGenerateSessionName')"
                placement="right"
              >
                <el-switch
                  v-model="chatSessionStore.getActiveSession!.chatOption.autoGenerateSessionName"
                />
              </el-tooltip>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 发音 -->
        <el-tab-pane name="speech">
          <template #label>
            <div class="setting-item-label">
              <el-icon><Microphone /></el-icon>
              <span>{{ $t('app.setting.speech') }}</span>
            </div>
          </template>
          <el-form label-width="auto" label-position="left">
            <!-- Model -->
            <el-form-item :label="$t('app.setting.item.speech.model')">
              <el-select
                v-model="chatSessionStore.getActiveSession!.speechOption.model"
                allow-create
                filterable
              >
                <el-option-group
                  v-for="group in OpenAISpeechModels"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-option-group>
              </el-select>
            </el-form-item>

            <!-- voice -->
            <el-form-item :label="$t('app.setting.item.speech.voice')">
              <el-select
                v-model="chatSessionStore.getActiveSession!.speechOption.voice"
                allow-create
                filterable
              >
                <el-option
                  v-for="item in OpenAISpeechVoices"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <!-- speed -->
            <el-form-item :label="$t('app.setting.item.speech.speed')">
              <el-input-number
                v-model="chatSessionStore.getActiveSession!.speechOption.speed"
                :min="0.25"
                :max="4.0"
                :step="0.01"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 文生图 -->
        <el-tab-pane v-if="chatSessionStore.getActiveSession!.textToImageOption" name="textToImage">
          <template #label>
            <div class="setting-item-label">
              <el-icon><Picture /></el-icon>
              <span>{{ $t('app.setting.textToImage') }}</span>
            </div>
          </template>
          <el-form label-width="auto" label-position="left">
            <!-- Enabled -->
            <el-form-item :label="$t('app.setting.item.textToImage.enabled')">
              <el-tooltip
                :content="$t('app.setting.item.textToImage.explain.enabled')"
                placement="right"
              >
                <el-switch v-model="chatSessionStore.getActiveSession!.textToImageOption.enabled" />
              </el-tooltip>
            </el-form-item>
            <!-- Model -->
            <el-form-item :label="$t('app.setting.item.textToImage.model')">
              <el-select
                v-model="chatSessionStore.getActiveSession!.textToImageOption.model"
                allow-create
                filterable
              >
                <el-option
                  v-for="item in OpenAIImageModels"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <!-- n -->
            <el-form-item :label="$t('app.setting.item.textToImage.n')">
              <el-input-number
                v-model="chatSessionStore.getActiveSession!.textToImageOption.n"
                :min="1"
                :max="
                  chatSessionStore.getActiveSession!.textToImageOption.model ===
                  OpenAIImageModelDallE3
                    ? 1
                    : 4
                "
                :step="1"
              />
            </el-form-item>
            <!-- quality -->
            <el-form-item
              v-if="
                chatSessionStore.getActiveSession!.textToImageOption.model ===
                OpenAIImageModelDallE3
              "
              :label="$t('app.setting.item.textToImage.quality')"
            >
              <el-select v-model="chatSessionStore.getActiveSession!.textToImageOption.quality">
                <el-option label="standard" value="standard" />
                <el-option label="hd" value="hd" />
              </el-select>
            </el-form-item>
            <!-- size -->
            <el-form-item :label="$t('app.setting.item.textToImage.size')">
              <el-select v-model="chatSessionStore.getActiveSession!.textToImageOption.size">
                <el-option
                  v-for="item in OpenAIImageSizes[
                    chatSessionStore.getActiveSession!.textToImageOption.model
                  ]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <!-- style -->
            <el-form-item
              v-if="
                chatSessionStore.getActiveSession!.textToImageOption.model ===
                OpenAIImageModelDallE3
              "
              :label="$t('app.setting.item.textToImage.style')"
            >
              <el-select v-model="chatSessionStore.getActiveSession!.textToImageOption.style">
                <el-option label="vivid" value="vivid" />
                <el-option label="natural" value="natural" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 记忆 -->
        <el-tab-pane v-if="chatSessionStore.getActiveSession!.memoryOption" name="memory">
          <template #label>
            <div class="setting-item-label">
              <el-icon><ChatDotSquare /></el-icon>
              <span>{{ $t('app.setting.memory') }}</span>
            </div>
          </template>
          <el-form label-width="auto" label-position="left">
            <!-- Enabled -->
            <el-form-item :label="$t('app.setting.item.memory.enabled')">
              <el-tooltip
                :content="$t('app.setting.item.memory.explain.enabled')"
                placement="right"
              >
                <el-switch v-model="chatSessionStore.getActiveSession!.memoryOption.enabled" />
              </el-tooltip>
            </el-form-item>
            <!-- Guide -->
            <el-form-item>
              <div class="setting-item-guide">{{ $t('app.setting.item.memory.guide') }}</div>
            </el-form-item>
            <!-- Manage -->
            <el-form-item>
              <MemoryDataSetting />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 互联网搜索 -->
        <el-tab-pane
          v-if="chatSessionStore.getActiveSession!.internetSearchOption"
          name="internetSearch"
        >
          <template #label>
            <div class="setting-item-label">
              <el-icon><Compass /></el-icon>
              <span>{{ $t('app.setting.internetSearch') }}</span>
            </div>
          </template>
          <el-form label-width="auto" label-position="left">
            <!-- Enabled -->
            <el-form-item :label="$t('app.setting.item.internetSearch.enabled')">
              <el-switch
                v-model="chatSessionStore.getActiveSession!.internetSearchOption.enabled"
              />
            </el-form-item>

            <!-- Search Result Count -->
            <el-form-item :label="$t('app.setting.item.internetSearch.count')">
              <el-input-number
                v-model="chatSessionStore.getActiveSession!.internetSearchOption.count"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 日历 -->
        <el-tab-pane v-if="chatSessionStore.getActiveSession!.calendarOption" name="calendar">
          <template #label>
            <div class="setting-item-label">
              <el-icon><Calendar /></el-icon>
              <span>{{ $t('app.setting.calendar') }}</span>
            </div>
          </template>
          <el-form label-width="auto" label-position="left">
            <!-- Enabled -->
            <el-form-item :label="$t('app.setting.item.calendar.queryEnabled')">
              <el-tooltip
                :content="$t('app.setting.item.calendar.explain.enabled')"
                placement="right"
              >
                <el-switch
                  v-model="chatSessionStore.getActiveSession!.calendarOption.queryEnabled"
                />
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('app.setting.item.calendar.addEnabled')">
              <el-tooltip
                :content="$t('app.setting.item.calendar.explain.enabled')"
                placement="right"
              >
                <el-switch v-model="chatSessionStore.getActiveSession!.calendarOption.addEnabled" />
              </el-tooltip>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-body {
  height: $app-dialog-height;

  :deep(.el-tabs) {
    height: 100%;

    .el-tabs--right,
    .el-tabs__content,
    .el-tabs--left,
    .el-tabs__content,
    .el-tab-pane {
      height: 100%;
    }

    .el-tabs__item {
      padding-left: 0;
    }
  }

  :deep(.el-tabs__content) {
    box-sizing: border-box;
    padding: $app-padding-extra-small $app-padding-small;
  }

  .setting-item-label {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: $app-padding-small;
  }

  .setting-item-guide {
    white-space: pre-wrap;
    line-break: anywhere;
    line-height: $app-line-height-base;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-small);
  }
}
</style>

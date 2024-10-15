<script setup lang="ts">
import { Bottom } from '@element-plus/icons-vue'
import ChatMessageAssistant from '@renderer/components/chat/message/ChatMessageAssistant.vue'
import ChatMessageDivider from '@renderer/components/chat/message/ChatMessageDivider.vue'
import ChatMessageError from '@renderer/components/chat/message/ChatMessageError.vue'
import ChatMessageUser from '@renderer/components/chat/message/ChatMessageUser.vue'
import { useStore } from '@renderer/store/store'
import { ref, nextTick, reactive, toRefs, onMounted } from 'vue'

// 仓库
const { chatSessionStore } = useStore()

// ref
const messageListScrollbarRef = ref()

// 定义事件
const emits = defineEmits(['regenerate'])

// 组件传参
const props = defineProps({
  // 消息选择是否显示
  messageCheckboxVisible: {
    type: Boolean,
    default: false
  }
})
// 消息选择，当前选中消息ID列表
const messageCheckIds = defineModel<string[]>('messageCheckIds', {
  default: () => []
})

// 数据绑定
const data = reactive({
  toBottomBtnVisible: false,
  autoScrollEnabled: true
})
const { toBottomBtnVisible } = toRefs(data)

// 滚动到底部
const scrollToBottom = (isAuto: boolean) => {
  nextTick(() => {
    if (!isAuto) {
      // 当前距离底部高度
      let diffHeight =
        messageListScrollbarRef.value.wrapRef.scrollHeight -
        messageListScrollbarRef.value.wrapRef.clientHeight -
        messageListScrollbarRef.value.wrapRef.scrollTop

      // 起始步长
      let stepHeight = Math.ceil(diffHeight * 0.2)

      // 周期任务
      const interval = setInterval(() => {
        // 滚动一个步长
        messageListScrollbarRef.value?.setScrollTop(
          messageListScrollbarRef.value.wrapRef.scrollTop + stepHeight
        )

        // 修改步长
        diffHeight -= stepHeight
        stepHeight = Math.ceil(diffHeight * 0.2)

        // 判断是否到达底部
        if (diffHeight <= 0) {
          // 停止周期任务
          clearInterval(interval)

          // 保证置底
          messageListScrollbarRef.value?.setScrollTop(
            messageListScrollbarRef.value.wrapRef.scrollHeight
          )
        }
      }, 10)
    } else if (data.autoScrollEnabled) {
      messageListScrollbarRef.value?.setScrollTop(
        messageListScrollbarRef.value.wrapRef.scrollHeight
      )
    }

    // 考虑无需滚动情况，计算置底按钮是否显示
    calcToBottomBtnVisible()
  })
}

// 监听消息列表滚动
const onMessageListScroll = () => {
  calcToBottomBtnVisible()
}

// 计算置底按钮是否显示
const calcToBottomBtnVisible = (delayFlag = true) => {
  // 滚动超过一定高度时，显示置底按钮
  const calcResult =
    messageListScrollbarRef.value.wrapRef.scrollHeight -
      messageListScrollbarRef.value.wrapRef.clientHeight -
      messageListScrollbarRef.value.wrapRef.scrollTop >
    1

  if (calcResult) {
    data.autoScrollEnabled = false
    if (delayFlag) {
      setTimeout(() => {
        calcToBottomBtnVisible(false)
      }, 500)
    } else {
      data.toBottomBtnVisible = true
    }
  } else {
    data.autoScrollEnabled = true
    data.toBottomBtnVisible = false
  }
}

// 消息选择
const onMessageCheckboxClick = (id: string, isPush: boolean) => {
  if (isPush) {
    messageCheckIds.value.push(id)
  } else {
    messageCheckIds.value = messageCheckIds.value.filter((item) => item !== id)
  }
}

// 暴露方法
defineExpose({
  scrollToBottom
})

// 挂载完毕
onMounted(() => {
  // 消息列表滚动到底部
  scrollToBottom(true)
})
</script>

<template>
  <div class="chat-body-message-list">
    <!-- 消息列表 -->
    <el-scrollbar ref="messageListScrollbarRef" height="100%" @scroll="onMessageListScroll">
      <div id="message-list-container" class="message-list-container">
        <div
          v-for="m in chatSessionStore.getActiveSession!.messages"
          :key="m.id"
          class="message-container"
        >
          <!-- 消息选择 -->
          <template v-if="props.messageCheckboxVisible">
            <el-checkbox
              v-if="messageCheckIds.includes(m.id!)"
              :checked="true"
              size="large"
              data-share-hide="true"
              @click="onMessageCheckboxClick(m.id!, false)"
            />
            <el-checkbox
              v-else
              size="large"
              data-share-hide="true"
              @click="onMessageCheckboxClick(m.id!, true)"
            />
          </template>

          <!-- 对话消息 -->
          <template v-if="m.type === 'chat'">
            <template v-if="m.role === 'user'">
              <ChatMessageUser
                :message="m"
                :data-share-hide="!messageCheckIds.includes(m.id!)"
                @clear-context="scrollToBottom(false)"
              />
            </template>
            <template v-else-if="m.role === 'assistant'">
              <ChatMessageAssistant
                :message="m"
                :data-share-hide="!messageCheckIds.includes(m.id!)"
                @regenerate="emits('regenerate', m.id)"
                @clear-context="scrollToBottom(false)"
              />
            </template>
          </template>

          <!-- 错误消息 -->
          <template v-else-if="m.type === 'error'">
            <ChatMessageError
              :message="m"
              :data-share-hide="!messageCheckIds.includes(m.id!)"
              @regenerate="emits('regenerate', m.id)"
              @clear-context="scrollToBottom(false)"
            />
          </template>

          <!-- 分隔消息 -->
          <template v-else-if="m.type === 'divider'">
            <ChatMessageDivider :message="m" :data-share-hide="!messageCheckIds.includes(m.id!)" />
          </template>
        </div>
      </div>
    </el-scrollbar>

    <!-- 置底按钮 -->
    <transition name="el-fade-in">
      <Bottom v-if="toBottomBtnVisible" class="to-bottom-btn" @click="scrollToBottom(false)" />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.chat-body-message-list {
  min-height: 0;
  width: 100%;
  flex: 1 1 0;
  position: relative;

  .message-list-container {
    width: 100%;
    background-color: var(--el-fill-color-extra-light);
    box-sizing: border-box;
    padding: $app-padding-base;
    display: flex;
    flex-direction: column;
    gap: $app-padding-base;

    .message-container {
      width: 100%;
      display: flex;
      gap: $app-padding-base;
      align-items: center;
    }
  }

  .to-bottom-btn {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
    height: $app-icon-size-base;
    width: $app-icon-size-base;
    border-radius: 50%;
    padding: $app-padding-extra-small;
    position: absolute;
    left: 50%;
    bottom: $app-padding-small;
    transform: translateX(-50%);
    cursor: pointer;
  }
}
</style>

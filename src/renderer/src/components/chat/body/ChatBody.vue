<script setup lang="ts">
import ChatBodyEmpty from '@renderer/components/chat/body/ChatBodyEmpty.vue'
import ChatBodyHeader from '@renderer/components/chat/body/ChatBodyHeader.vue'
import ChatBodyInput from '@renderer/components/chat/body/ChatBodyInput.vue'
import ChatBodyMessageList from '@renderer/components/chat/body/ChatBodyMessageList.vue'
import ChatBodyShare from '@renderer/components/chat/body/ChatBodyShare.vue'
import { useStore } from '@renderer/store/store'
import { ref, reactive, toRefs, nextTick, watch } from 'vue'

// 仓库
const { chatSessionStore } = useStore()

// ref
const bodyMessageListRef = ref()
const bodyInputRef = ref()

// 数据绑定
const data = reactive({
  messageCheckboxVisible: false,
  messageCheckIds: [] as string[]
})
const { messageCheckboxVisible, messageCheckIds } = toRefs(data)

// 监听消息选择是否可见
watch(
  () => data.messageCheckboxVisible,
  () => {
    if (data.messageCheckboxVisible) {
      onShare()
    }
  }
)

// 分享触发
const onShare = () => {
  data.messageCheckIds = chatSessionStore.getActiveSession!.messages.map((m) => m.id!)
  data.messageCheckboxVisible = true
  nextTick(() => {
    bodyMessageListRef.value?.scrollToBottom(false)
  })
}

// 选择文件
const selectAttachment = async (files?: SelectFile[]) => {
  await bodyInputRef.value.selectAttachment(files)
}

// 暴露函数
defineExpose({
  selectAttachment
})
</script>

<template>
  <div class="chat-body">
    <!-- 头部 -->
    <ChatBodyHeader v-model:share-visible="messageCheckboxVisible" />

    <!-- 消息列表 -->
    <ChatBodyMessageList
      v-if="chatSessionStore.getActiveSession!.messages.length > 0"
      ref="bodyMessageListRef"
      v-model:message-check-ids="messageCheckIds"
      :message-checkbox-visible="messageCheckboxVisible"
      @regenerate="(messageId: string) => bodyInputRef.regenerate(messageId)"
    />

    <!-- 空状态 -->
    <ChatBodyEmpty v-else @use-prompt="(prompt) => bodyInputRef.updateQuestion(prompt)" />

    <!-- 输入区域 -->
    <ChatBodyInput
      v-if="!messageCheckboxVisible"
      ref="bodyInputRef"
      @send-question="bodyMessageListRef?.scrollToBottom(false)"
      @update-message="bodyMessageListRef?.scrollToBottom(true)"
    />

    <!-- 分享按钮组 -->
    <ChatBodyShare
      v-else
      v-model:visible="messageCheckboxVisible"
      v-model:message-check-ids="messageCheckIds"
    />
  </div>
</template>

<style lang="scss" scoped>
.chat-body {
  height: 100%;
  min-width: 0;
  flex: 1 1 0;
  background-color: var(--el-fill-color-extra-light);
  display: flex;
  flex-direction: column;
  gap: $app-padding-small;
}
</style>

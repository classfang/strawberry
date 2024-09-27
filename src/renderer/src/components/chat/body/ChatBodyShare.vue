<script setup lang="ts">
import { Document, Picture } from '@element-plus/icons-vue'
import ChatBodyShareView from '@renderer/components/chat/body/ChatBodyShareView.vue'
import { useAppStateStore } from '@renderer/store/app-state'
import { useChatSessionStore } from '@renderer/store/chat-session'
import { nowTimestamp } from '@renderer/utils/date-util'
import { exportTextFile } from '@renderer/utils/download-util'
import { ElMessageBox } from 'element-plus'
import { reactive, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

// i18n
const { t } = useI18n()

// 仓库
const appStateStore = useAppStateStore()
const chatSessionStore = useChatSessionStore()

// 组件传参
const messageCheckIds = defineModel<string[]>('messageCheckIds', {
  default: () => []
})
const visible = defineModel<boolean>('visible', {
  default: () => false
})

// 数据绑定
const data = reactive({
  shareViewVisible: false
})
const { shareViewVisible } = toRefs(data)

// 全选
const selectAll = () => {
  messageCheckIds.value = chatSessionStore.getActiveSession!.messages.map((m) => m.id!)
}

// 反选
const selectAgainst = () => {
  messageCheckIds.value = chatSessionStore
    .getActiveSession!.messages.filter((m) => !messageCheckIds.value.includes(m.id!))
    .map((m) => m.id!)
}

// 分享图片
const shareImage = () => {
  if (appStateStore.chatLoadingFlag || messageCheckIds.value.length === 0) {
    return
  }

  data.shareViewVisible = true
}

// 分享文本
const shareText = () => {
  if (appStateStore.chatLoadingFlag) {
    return
  }

  const messages = chatSessionStore.getActiveSession?.messages.filter((m) =>
    messageCheckIds.value.includes(m.id!)
  )
  if (!messages || messages.length === 0) {
    return
  }

  ElMessageBox.confirm(t('app.chat.body.share.text.content'), t('app.chat.body.share.text.title'), {
    distinguishCancelAndClose: true,
    confirmButtonText: t('app.chat.body.share.text.confirm'),
    cancelButtonText: t('app.chat.body.share.text.cancel')
  }).then(() => {
    // 生成导出文本（使用一些 Markdown 语法）
    const exportText = messages
      .map((m) => {
        if (m.type === 'divider') {
          return `${t('app.chat.body.message.disconnectedContext')}`
        } else {
          return `#### ${m.role}: \n${m.content}`
        }
      })
      .join('\n\n---\n\n')

    // 导出文本
    exportTextFile(`share-text-${nowTimestamp()}.txt`, exportText)

    // 关闭分享
    visible.value = false
  })
}
</script>

<template>
  <div class="chat-body-share">
    <div class="select-btn-group">
      <el-button type="primary" link @click="selectAll">
        {{ $t('app.chat.body.share.selectAll') }}
      </el-button>
      <el-button type="primary" link @click="selectAgainst">
        {{ $t('app.chat.body.share.selectAgainst') }}
      </el-button>
    </div>
    <div class="share-btn-group">
      <el-button type="primary" :icon="Picture" @click="shareImage()">
        {{ $t('app.chat.body.share.image.title') }}
      </el-button>
      <el-button :icon="Document" @click="shareText()">
        {{ $t('app.chat.body.share.text.title') }}
      </el-button>
    </div>

    <!-- 图片分享弹窗 -->
    <ChatBodyShareView v-model:visible="shareViewVisible" @ok="visible = false" />
  </div>
</template>

<style scoped lang="scss">
.chat-body-share {
  width: 100%;
  box-sizing: border-box;
  padding: 0 $app-padding-base $app-padding-base $app-padding-base;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $app-padding-small;

  .select-btn-group,
  .share-btn-group {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

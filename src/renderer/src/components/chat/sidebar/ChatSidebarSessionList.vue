<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import ChatSidebarSession from '@renderer/components/chat/sidebar/ChatSidebarSession.vue'
import { useStore } from '@renderer/store/store'
import dayjs from 'dayjs'
import { computed, nextTick, onMounted, reactive, ref, toRefs } from 'vue'

// 仓库
const { chatSessionStore, appStateStore } = useStore()

// ref
const sessionListScrollbarRef = ref()

// 数据绑定
const data = reactive({
  sessionKeyword: ''
})
const { sessionKeyword } = toRefs(data)

// 计算会话列表
const messageListComputed = computed(() => {
  return chatSessionStore.getUsedSessions.filter(
    (session) =>
      session.name.includes(data.sessionKeyword) ||
      session.messages.findIndex((m) => m.content.includes(data.sessionKeyword)) > -1
  )
})

// 计算日期标签
const dateFlagMap = computed(() => {
  const map = new Map<number, string>()

  // 动态获取今天
  const today = dayjs(appStateStore.dayKey)

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) => dayjs(s.createTime).format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
    ),
    'today'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) => dayjs(s.createTime).format('YYYY-MM-DD') === today.add(-1, 'day').format('YYYY-MM-DD')
    ),
    'yesterday'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-1, 'day'), 'day') &&
        dayjs(s.createTime).isAfter(today.add(-7, 'day'), 'day')
    ),
    'previous7'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-7, 'day'), 'day') &&
        dayjs(s.createTime).isAfter(today.add(-30, 'day'), 'day')
    ),
    'previous30'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 0
    ),
    'january'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 1
    ),
    'february'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 2
    ),
    'march'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 3
    ),
    'april'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 4
    ),
    'may'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 5
    ),
    'june'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 6
    ),
    'july'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 7
    ),
    'august'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 8
    ),
    'september'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 9
    ),
    'october'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 10
    ),
    'november'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex(
      (s) =>
        dayjs(s.createTime).format('YYYY') === today.format('YYYY') &&
        dayjs(s.createTime).isBefore(today.add(-30, 'day'), 'day') &&
        dayjs(s.createTime).get('month') === 11
    ),
    'december'
  )

  map.set(
    chatSessionStore.getUsedSessions.findIndex((s) => dayjs(s.createTime).isBefore(today, 'year')),
    'earlier'
  )

  return map
})

// 滚动到顶部
const scrollToTop = () => {
  sessionListScrollbarRef.value?.setScrollTop(0)
}

// 暴露方法
defineExpose({
  scrollToTop
})

onMounted(() => {
  nextTick(() => {
    // 当前会话进入视窗
    document.querySelector('.chat-session-active')?.scrollIntoView(false)
  })
})
</script>

<template>
  <div class="chat-session-list">
    <!-- 搜索 -->
    <div class="chat-session-list-search">
      <el-input
        v-model="sessionKeyword"
        :prefix-icon="Search"
        :placeholder="$t('app.common.search')"
      />
    </div>

    <!-- 会话列表 -->
    <template v-if="messageListComputed.length > 0">
      <div class="chat-session-list-scrollbar">
        <el-scrollbar ref="sessionListScrollbarRef" height="100%">
          <div class="session-list">
            <template v-for="(s, index) in messageListComputed" :key="s.id">
              <!-- 日期标签 -->
              <div v-if="dateFlagMap.get(index)" class="date-flag">
                {{ $t('app.chat.sidebar.session.dateFlag.' + dateFlagMap.get(index)) }}
              </div>

              <!-- 会话 -->
              <ChatSidebarSession :session="s" />
            </template>
          </div>
        </el-scrollbar>
      </div>
    </template>

    <!-- 暂无数据 -->
    <template v-else>
      <div class="session-list-empty">
        {{ $t('app.chat.sidebar.session.empty') }}
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.chat-session-list {
  min-height: 0;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  .chat-session-list-search {
    padding: 0 $app-padding-base;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.el-input) {
      .el-input__wrapper {
        background-color: var(--el-fill-color-dark);
        box-shadow: none;
        border-radius: $app-border-radius-base;
      }
    }
  }

  .chat-session-list-scrollbar {
    min-height: 0;
    flex: 1 1 0;
    width: 100%;

    .session-list {
      min-height: 0;
      flex: 1 1 0;
      width: 100%;
      box-sizing: border-box;
      padding: $app-padding-base $app-padding-base 0 $app-padding-base;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $app-padding-extra-small;

      .date-flag {
        width: 100%;
        color: var(--el-text-color-secondary);
        font-size: var(--el-font-size-small);
        line-height: $app-line-height-min;
        margin: $app-padding-extra-small 0;
      }
    }
  }

  .session-list-empty {
    min-height: 0;
    flex: 1 1 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
  }
}
</style>

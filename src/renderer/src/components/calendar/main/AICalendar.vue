<script setup lang="ts">
import { Star, StarFilled } from '@element-plus/icons-vue'
import NoteEditor from '@renderer/components/calendar/editor/NoteEditor.vue'
import { useStore } from '@renderer/store/store'
import dayjs from 'dayjs'
import { computed, reactive, toRefs } from 'vue'

// 仓库
const { aiCalendarStore } = useStore()

// 组件传参
const drawerVisible = defineModel<boolean>('drawerVisible', {
  default: () => false
})

// 数据绑定
const data = reactive({
  current: new Date(),
  noteDialogVisible: false,
  noteContent: ''
})
const { current, noteDialogVisible, noteContent } = toRefs(data)

// 打开备忘编辑
const openNoteDialogVisible = (dayStr: string) => {
  data.noteContent = aiCalendarStore.dayNotes[dayStr]?.content ?? ''
  data.noteDialogVisible = true
}

// 保存修改
const saveNote = () => {
  aiCalendarStore.saveNote({
    time: dayjs(data.current).format('YYYY-MM-DD'),
    content: data.noteContent
  })

  data.noteContent = ''
  data.noteDialogVisible = false
}

// 计算Star数量
const starCount = computed(() => {
  let count = 0
  Object.values(aiCalendarStore.dayNotes).forEach((dayNote) => {
    if (dayNote?.starred) {
      count++
    }
  })
  return count
})

// 加星
const starNote = (day: string) => {
  if (aiCalendarStore.dayNotes[day]) {
    aiCalendarStore.dayNotes[day].starred = true
  }
}

// 取消加星
const unstarNote = (day: string) => {
  if (aiCalendarStore.dayNotes[day]) {
    aiCalendarStore.dayNotes[day].starred = false
  }
}

// 修改当前日期
const changeCurrent = (day: string) => {
  data.current = dayjs(day).toDate()
}
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    size="90%"
    direction="btt"
    class="ai-calendar-drawer"
    destroy-on-close
    append-to-body
  >
    <template #header>
      <div class="drawer-header">
        <div class="drawer-header-title">{{ $t('app.calendar.title') }}</div>
        <el-dropdown trigger="click" placement="bottom-start">
          <el-button :icon="Star" size="small" type="primary" plain>
            {{ $t('app.calendar.starredList.title') }}
            {{ starCount > 0 ? starCount : '' }}
          </el-button>
          <template #dropdown>
            <div class="starred-list">
              <el-scrollbar v-if="starCount > 0" height="100%">
                <el-dropdown-menu>
                  <template v-for="(note, key) in aiCalendarStore.dayNotes">
                    <el-dropdown-item v-if="note.starred" :key="key" @click="changeCurrent(key)">
                      <el-text truncated> [ {{ key }} ] {{ note.content }} </el-text>
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-scrollbar>
              <template v-else>
                <div class="starred-list-empty">
                  {{ $t('app.calendar.starredList.empty') }}
                </div>
              </template>
            </div>
          </template>
        </el-dropdown>
      </div>
    </template>
    <div class="ai-calendar">
      <el-calendar v-model="current">
        <template #date-cell="t">
          <div class="ai-calendar-day" @dblclick="openNoteDialogVisible(t.data.day)">
            <div class="ai-calendar-day-title">
              <div>{{ dayjs(t.data.date).date() }}</div>
              <template v-if="aiCalendarStore.dayNotes[t.data.day]">
                <transition-group name="el-zoom-in-center">
                  <StarFilled
                    v-if="aiCalendarStore.dayNotes[t.data.day]?.starred"
                    class="ai-calendar-day-starred"
                    @click="unstarNote(t.data.day)"
                  />
                  <Star v-else class="ai-calendar-day-star" @click="starNote(t.data.day)" />
                </transition-group>
              </template>
            </div>
            <div class="ai-calendar-day-content">
              {{ aiCalendarStore.dayNotes[t.data.day]?.content }}
            </div>
          </div>
        </template>
      </el-calendar>

      <el-dialog
        v-model="noteDialogVisible"
        :title="$t('app.calendar.note.title') + ` ${dayjs(current).format('YYYY/MM/DD')}`"
        width="700"
        align-center
        destroy-on-close
        :close-on-click-modal="false"
      >
        <div class="dialog-body">
          <el-scrollbar height="100%">
            <NoteEditor v-model:content="noteContent" :min-rows="20" />
          </el-scrollbar>
        </div>
        <template #footer>
          <el-button @click="noteDialogVisible = false">
            {{ $t('app.common.cancel') }}
          </el-button>
          <el-button type="primary" @click="saveNote()">
            {{ $t('app.common.confirm') }}
          </el-button>
        </template>
      </el-dialog>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
.ai-calendar {
  height: 100%;
  width: 100%;
  display: flex;

  :deep(.el-calendar) {
    display: flex;
    flex-direction: column;

    .el-calendar__header {
      border-bottom: none;
      padding: $app-padding-small 0;
    }

    .el-calendar__body {
      flex: 1 1 0;
      min-height: 0;
      padding: 0;

      .el-calendar-table {
        height: 100%;

        .el-calendar-day {
          height: 100%;
        }
      }
    }
  }

  .ai-calendar-day {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: $app-padding-extra-small;

    &:hover {
      .ai-calendar-day-title {
        .ai-calendar-day-star {
          opacity: 1;
        }
      }
    }

    .ai-calendar-day-title {
      font-size: var(--el-font-size-medium);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .ai-calendar-day-star,
      .ai-calendar-day-starred {
        height: var(--el-font-size-medium);
        width: var(--el-font-size-medium);
        transition: all $app-transition-fast;
      }

      .ai-calendar-day-star {
        opacity: 0;
        color: var(--el-text-color-secondary);
      }

      .ai-calendar-day-starred {
        color: var(--el-color-primary);
      }
    }

    .ai-calendar-day-content {
      flex: 1 1 0;
      min-height: 0;
      white-space: pre-wrap;
      line-break: anywhere;
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-small);
      overflow: hidden;
    }
  }

  .dialog-body {
    height: $app-dialog-height;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
  }
}
</style>

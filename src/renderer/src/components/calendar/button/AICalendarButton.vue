<script setup lang="ts">
import { Calendar, Star } from '@element-plus/icons-vue'
import AICalendar from '@renderer/components/calendar/main/AICalendar.vue'
import { useStore } from '@renderer/store/store'
import { computed, reactive, ref, toRefs } from 'vue'

// 仓库
const { appStateStore, aiCalendarStore } = useStore()

// ref
const aiCalendarRef = ref()

// 数据绑定
const data = reactive({
  drawerVisible: false
})
const { drawerVisible } = toRefs(data)

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
</script>

<template>
  <div>
    <el-button :icon="Calendar" plain size="small" @click="drawerVisible = true">
      {{ $t('app.calendar.title') }}
    </el-button>
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
                      <el-dropdown-item
                        v-if="note.starred"
                        :key="key"
                        @click="aiCalendarRef.changeCurrent(key)"
                      >
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
      <AICalendar :key="`ai-calendar-${appStateStore.dayKey}`" ref="aiCalendarRef" />
    </el-drawer>
  </div>
</template>

<style lang="scss">
.ai-calendar-drawer {
  border-radius: $app-border-radius-base $app-border-radius-base 0 0;

  .el-drawer__header {
    margin-bottom: 0;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: $app-padding-base;

    .drawer-header-title {
      font-size: var(--el-font-size-medium);
    }
  }
}

.starred-list {
  width: $app-dialog-height;
  height: $app-dialog-height;

  .starred-list-empty {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
  }
}
</style>

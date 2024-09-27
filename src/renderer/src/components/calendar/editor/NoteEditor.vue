<script setup lang="ts">
import { nextTick } from 'vue'

// 组件传参
const props = defineProps({
  minRows: {
    type: Number,
    default: 1
  }
})
const content = defineModel<string>('content', {
  default: () => ''
})

// 监听输入
const noteEditorInput = (newValue: string) => {
  // 换行操作
  if (newValue === content.value + '\n') {
    const lines = content.value.split('\n')

    // 序号开头
    const matchResult = lines.at(-1)?.match(/^\d+\.\s/)
    if (matchResult) {
      // 追加序号
      nextTick(() => {
        content.value = `${newValue}${Number(matchResult[0].replace('. ', '')) + 1}. `
      })
    }
  }
}
</script>

<template>
  <div class="note-editor">
    <el-input
      v-model="content"
      type="textarea"
      :placeholder="$t('app.calendar.note.placeholder')"
      :autosize="{ minRows: props.minRows }"
      resize="none"
      @input="noteEditorInput"
    />
  </div>
</template>

<style scoped lang="scss">
.note-editor {
  :deep(.el-textarea) {
    .el-textarea__inner {
      box-shadow: none;
    }
  }
}
</style>

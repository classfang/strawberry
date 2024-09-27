<script setup lang="ts">
defineProps({
  extname: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 30
  }
})
</script>

<template>
  <img
    v-if="extname === '.txt'"
    :height="size"
    alt="avatar"
    src="@renderer/assets/image/file-txt.png"
  />
  <img
    v-else-if="extname === '.pdf'"
    :height="size"
    alt="avatar"
    src="@renderer/assets/image/file-pdf.png"
  />
  <img
    v-else-if="extname === '.docx'"
    :height="size"
    alt="avatar"
    src="@renderer/assets/image/file-docx.png"
  />
  <img
    v-else-if="extname === '.xlsx'"
    :height="size"
    alt="avatar"
    src="@renderer/assets/image/file-xlsx.png"
  />
  <img
    v-else-if="extname === '.pptx'"
    :height="size"
    alt="avatar"
    src="@renderer/assets/image/file-pptx.png"
  />
  <img v-else alt="avatar" :height="size" src="@renderer/assets/image/file-other.png" />
</template>

<style lang="less" scoped></style>

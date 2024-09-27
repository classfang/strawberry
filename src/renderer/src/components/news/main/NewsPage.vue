<script setup lang="ts">
import { Back, RefreshRight, Right } from '@element-plus/icons-vue'
import { reactive, ref, toRefs } from 'vue'

// ref
const webviewRef = ref()

// 数据绑定
const data = reactive({
  webviewSrc: 'https://openai.com/news/',
  canGoBack: false,
  canGoForward: false
})
const { webviewSrc, canGoBack, canGoForward } = toRefs(data)

// webview加载完毕
const webviewEndLoad = () => {
  data.webviewSrc = webviewRef.value.getURL()
  data.canGoBack = webviewRef.value.canGoBack()
  data.canGoForward = webviewRef.value.canGoForward()
}
</script>

<template>
  <div class="news-page">
    <div class="webview-console">
      <el-button
        class="webview-console-button"
        link
        :icon="Back"
        :disabled="!canGoBack"
        @click="webviewRef.goBack()"
      />
      <el-button
        class="webview-console-button"
        link
        :icon="Right"
        :disabled="!canGoForward"
        @click="webviewRef.goForword()"
      />
      <el-button
        class="webview-console-button"
        link
        :icon="RefreshRight"
        @click="webviewRef.reload()"
      />
      <el-input v-model="webviewSrc" readonly />
    </div>
    <webview
      ref="webviewRef"
      class="webview"
      :src="webviewSrc"
      allowpopups
      @did-stop-loading="webviewEndLoad"
    />
  </div>
</template>

<style scoped lang="scss">
.news-page {
  height: 100%;
  width: 100%;
  border-radius: $app-border-radius-base;
  display: flex;
  flex-direction: column;
  gap: $app-padding-base;

  .webview-console {
    width: 100%;
    display: flex;
    align-items: center;
    gap: $app-padding-base;

    .webview-console-button {
      font-size: var(--el-font-size-large);
      margin: 0;
    }
  }

  .webview {
    min-height: 0;
    flex: 1 1 0;
    background-color: var(--el-fill-color-light);
  }
}
</style>

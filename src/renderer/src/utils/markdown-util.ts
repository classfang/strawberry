import '@renderer/assets/css/markdown-code.scss'
import i18n from '@renderer/i18n'
import { textToBase64, base64ToText } from '@renderer/utils/base64-util'
import markdownItKatex from '@vscode/markdown-it-katex'
import ClipboardJS from 'clipboard'
import { ElMessage } from 'element-plus'
import hljs from 'highlight.js'
import 'highlight.js/scss/github-dark.scss'
import 'katex/dist/katex.css'
import MarkdownIt from 'markdown-it'

// 多语言
const { t } = i18n.global

// 结尾标识
const endFlag = '【end】'

// 代码复制
const clipboard = new ClipboardJS('.code-header-copy', {
  text: function (trigger) {
    const base64Str = trigger.getAttribute('data-clipboard-text-base64')
    return base64Str ? base64ToText(base64Str) : ''
  }
})
clipboard.on('success', () => {
  ElMessage.success(t('app.chat.body.message.copied'))
})

// MarkdownIt
const markdown = new MarkdownIt({
  highlight: (str: string, lang: string) => {
    // 可能带有 endFlag
    let insertEndFlag = false
    if (str && str.endsWith(endFlag)) {
      str = str.replace(endFlag, '')
      insertEndFlag = true
    }
    if (lang && lang.endsWith(endFlag)) {
      lang = lang.replace(endFlag, '')
      insertEndFlag = true
    }

    // 不支持的 lang 统一使用 text
    if (!hljs.getLanguage(lang)) {
      lang = 'text'
    }

    return `<pre><div class="code-header">
        <div>${lang}</div>
        <div class="code-header-copy" data-clipboard-text-base64='${textToBase64(str)}'>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span>${t('app.common.copy')}</span>
        </div>
      </div><code class="code-body hljs language-${lang}">${
        hljs.highlight(str, { language: lang }).value
      }${insertEndFlag ? endFlag : ''}</code></pre>`
  }
})

// 支持数学公式，svg渲染，无需引入额外样式
markdown.use(markdownItKatex)

// 渲染函数
export const renderMarkdown = (content: string, isLoading: boolean) => {
  if (!isLoading) {
    return markdown.render(content)
  }

  // 加载中，显示闪烁光标
  let htmlCode = markdown.render(content + endFlag)
  // 找到结束标识
  const endFlagIndex = htmlCode.lastIndexOf(endFlag)
  // 插入光标元素
  htmlCode =
    htmlCode.substring(0, endFlagIndex) +
    `<span class="chat-message-loading">丨</span>` +
    htmlCode.substring(endFlagIndex + endFlag.length)
  return htmlCode
}

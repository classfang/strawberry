import { Logger } from '@renderer/service/logger-service'
import dayjs from 'dayjs'
import OpenAI from 'openai'

export interface OpenAIChatParam {
  baseURL: string
  apiKey: string
  params: OpenAI.ChatCompletionCreateParams
  abortCtrSignal?: AbortSignal
  answer?: (chunk: OpenAI.ChatCompletionChunk) => void
  end?: () => void
  error?: (error: any) => void
}

export interface OpenAISpeechParam {
  baseURL: string
  apiKey: string
  abortCtrSignal?: AbortSignal
  params: OpenAI.Audio.SpeechCreateParams
}

// 对话
export const openaiChat = async (param: OpenAIChatParam) => {
  try {
    // OpenAI实例
    const openai = new OpenAI({
      baseURL: param.baseURL,
      apiKey: param.apiKey,
      dangerouslyAllowBrowser: true
    })

    Logger.info('openai chat request params: ', param.params)

    // 增加系统消息
    param.params.messages.unshift({
      role: 'system',
      content: `The current time is ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
    })

    // 流式对话
    if (param.params.stream) {
      const stream = await openai.chat.completions.create(param.params, {
        signal: param.abortCtrSignal
      })

      // 连续回答
      for await (const chunk of stream) {
        if (param.abortCtrSignal?.aborted) {
          return null
        }
        Logger.info('openai chat response chunk: ', chunk)
        param.answer && param.answer(chunk)
      }
    } else {
      const completion = await openai.chat.completions.create(param.params)

      // 一次性回答
      Logger.info('openai chat response completion: ', completion)
      return completion
    }
  } catch (e: any) {
    Logger.error('openai chat error: ', e.message)
    param.error && param.error(e)
  }

  param.end && param.end()

  return null
}

// 发音
export const openaiSpeech = async (param: OpenAISpeechParam) => {
  // OpenAI实例
  const openai = new OpenAI({
    apiKey: param.apiKey,
    baseURL: param.baseURL,
    dangerouslyAllowBrowser: true
  })
  const mp3 = await openai.audio.speech.create({
    ...param.params
  })
  return await mp3.arrayBuffer()
}

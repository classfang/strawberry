// https://platform.openai.com/docs/models
export const OpenAIModels = [
  {
    label: 'GPT-4o',
    options: [
      {
        value: 'gpt-4o',
        label: 'gpt-4o'
      },
      {
        value: 'chatgpt-4o-latest',
        label: 'chatgpt-4o-latest'
      }
    ]
  },
  {
    label: 'GPT-4o mini',
    options: [
      {
        value: 'gpt-4o-mini',
        label: 'gpt-4o-mini'
      }
    ]
  },
  {
    label: 'o1',
    options: [
      {
        value: 'o1-preview',
        label: 'o1-preview'
      },
      {
        value: 'o1-mini',
        label: 'o1-mini'
      }
    ]
  },
  {
    label: 'GPT-4 Turbo and GPT-4',
    options: [
      {
        value: 'gpt-4-turbo',
        label: 'gpt-4-turbo'
      },
      {
        value: 'gpt-4-turbo-preview',
        label: 'gpt-4-turbo-preview'
      },
      {
        value: 'gpt-4',
        label: 'gpt-4'
      }
    ]
  },
  {
    label: 'GPT-3.5 Turbo',
    options: [
      {
        value: 'gpt-3.5-turbo',
        label: 'gpt-3.5-turbo'
      },
      {
        value: 'gpt-3.5-turbo-instruct',
        label: 'gpt-3.5-turbo-instruct'
      }
    ]
  }
]

export const OpenAISpeechModels = [
  {
    label: 'tts-1',
    options: [
      {
        value: 'tts-1',
        label: 'tts-1'
      },
      {
        value: 'tts-1-hd',
        label: 'tts-1-hd'
      }
    ]
  }
]

export const OpenAISpeechVoices = [
  {
    value: 'alloy',
    label: 'alloy'
  },
  {
    value: 'echo',
    label: 'echo'
  },
  {
    value: 'fable',
    label: 'fable'
  },
  {
    value: 'onyx',
    label: 'onyx'
  },
  {
    value: 'nova',
    label: 'nova'
  },
  {
    value: 'shimmer',
    label: 'shimmer'
  }
]

export const OpenAIImageModels = [
  {
    value: 'dall-e-2',
    label: 'dall-e-2'
  },
  {
    value: 'dall-e-3',
    label: 'dall-e-3'
  }
]

export const OpenAIImageModelDallE3 = 'dall-e-3'

export const OpenAIImageSizes = {
  'dall-e-2': [
    {
      value: '256x256',
      label: '256x256'
    },
    {
      value: '512x512',
      label: '512x512'
    },
    {
      value: '1024x1024',
      label: '1024x1024'
    }
  ],
  'dall-e-3': [
    {
      value: '1024x1024',
      label: '1024x1024'
    },
    {
      value: '1792x1024',
      label: '1792x1024'
    },
    {
      value: '1024x1792',
      label: '1024x1792'
    }
  ]
}

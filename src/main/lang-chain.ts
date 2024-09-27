import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx'
import { ipcMain } from 'electron'
import { TextLoader } from 'langchain/document_loaders/fs/text'

export const initLangChain = () => {
  // langChain 加载文件
  ipcMain.handle('lang-chain-load-file', async (_event, filePath: string) => {
    let loader: any = null
    if (filePath.endsWith('.txt')) {
      loader = new TextLoader(filePath)
    } else if (filePath.endsWith('.pdf')) {
      loader = new PDFLoader(filePath)
    } else if (filePath.endsWith('.docx')) {
      loader = new DocxLoader(filePath)
    } else if (filePath.endsWith('.pptx')) {
      loader = new PPTXLoader(filePath)
    }

    if (!loader) {
      return ''
    }

    const docs = await loader.load()
    if (!docs || docs.length === 0) {
      return ''
    }

    return docs.reduce((accumulator, currentObject) => {
      return accumulator + currentObject.pageContent
    }, '')
  })
}

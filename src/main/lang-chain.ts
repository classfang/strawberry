import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx'
import { ipcMain } from 'electron'
import { TextLoader } from 'langchain/document_loaders/fs/text'

interface FileLoader {
  new (filePath: string): any
}

const fileLoaderMap: { [key: string]: FileLoader } = {
  '.txt': TextLoader,
  '.md': TextLoader,
  '.pdf': PDFLoader,
  '.docx': DocxLoader,
  '.pptx': PPTXLoader
}

export const initLangChain = () => {
  // langChain 加载文件
  ipcMain.handle('lang-chain-load-file', async (_event, filePath: string) => {
    let loader: any = null
    const LoaderClass = fileLoaderMap[filePath.slice(filePath.lastIndexOf('.'))]
    if (LoaderClass) {
      loader = new LoaderClass(filePath)
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

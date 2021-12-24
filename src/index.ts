import fs from 'fs'
import http from 'http'
import https from 'https'
import { TimeoutError } from './errors'
export interface SimpledownloadOptions {
  timeout?: number;
}

async function simpledownload(url: string, localPath: string, options?: SimpledownloadOptions): Promise<void> {
  const urlObj = new URL(url);
  const httpClient = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {

    // if error, release all resources
    function releaseWhenError() {
      request.destroy()
      file.close()
      delWhenExist(localPath)
    }
    const file = fs.createWriteStream(localPath)
    file.on('finish', () => {
      resolve()
    })
    file.on('error', (err) => {
      releaseWhenError()
      reject(err);
    })

    const request = httpClient.get(url, (response) => {
      response.pipe(file)

    })
    request.on('error', (err) => {
      releaseWhenError()
      reject(err)
    })

    // handle timeout
    if (options?.timeout) {
      const timeout = options.timeout
      setTimeout(() => {
        releaseWhenError()
        reject(new TimeoutError(timeout))
      }, timeout);
    }
  })
}

// if path exists, delete it
async function delWhenExist(path: string) {
  try {
    await fs.promises.unlink(path)
  } catch (e) {
    // do nothing
  }
}

export { simpledownload }
export default simpledownload
export * from './errors'
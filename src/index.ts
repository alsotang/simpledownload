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
  const file = fs.createWriteStream(localPath)
  const request = httpClient.get(url, (response) => {
    response.pipe(file)
  })

  return new Promise<void>((resolve, reject) => {
    file.on('finish', () => {
      resolve()
    })
    file.on('error', (err) => {
      reject(err);
    })

    request.on('error', (err) => {
      reject(err)
    })

    // handle timeout
    if (options?.timeout) {
      const timeout = options.timeout
      setTimeout(() => {
        reject(new TimeoutError(timeout))
      }, timeout);
    }
  })
  .catch((err) => {
    // if error, release all resources
    request?.destroy()
    file.close()
    delWhenExist(localPath)
    throw err;
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
import fs from 'fs'
import http from 'http'

interface SimpledownloadOptions {
  timeout?: number;
}

function simpledownload(url: string, localPath: string, options?: SimpledownloadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      const file = fs.createWriteStream(localPath)
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    })
    request.on('error', (err) => {
      fs.unlink(localPath, () => {})
      reject(err)
    })
    if (options && options.timeout) {
      request.setTimeout(options.timeout)
    }
  })
}

export {simpledownload}
export default simpledownload
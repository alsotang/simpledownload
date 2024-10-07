import fs from 'fs'
import http from 'http'
import https from 'https'
import { TimeoutError } from './errors'
export interface SimpledownloadOptions {
  timeout?: number;
  agent?: http.Agent;
}

/**
 * httpGet - This function handles HTTP GET requests and follows redirects if encountered.
 */
function httpGet(url: string, options: SimpledownloadOptions): Promise<{
  request: http.ClientRequest,
  response: http.IncomingMessage
}> {
  const urlObj = new URL(url);
  const httpAgent = options.agent;
  const httpLib = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = httpLib.get(url, { agent: httpAgent }, async (response) => {
      // follow redirect
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location!
        request.destroy()
        // recursively follow redirect
        const { request: request2, response: response2 } = await httpGet(redirectUrl, options)
        resolve({ request: request2, response: response2 })
      } else {
        resolve({ request, response })
      }
    })
  })
}

async function simpledownload(url: string, localPath: string, options: SimpledownloadOptions = {}): Promise<void> {
  const { request, response } = await httpGet(url, options)
  let file: fs.WriteStream
  return new Promise<void>(async (resolve, reject) => {
    file = fs.createWriteStream(localPath)
    file.on('finish', () => {
      resolve()
    })
    file.on('error', (err) => {
      reject(err);
    })

    request.on('error', (err) => {
      reject(err)
    })

    response.pipe(file)

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
export * from './errors'
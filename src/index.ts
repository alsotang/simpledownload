import fs from 'fs'
import http from 'http'
import https from 'https'
import { HttpStatusCodeError, TimeoutError } from './errors'

type DownloadAgent = http.Agent | https.Agent;
type DownloadResult = {
  request: http.ClientRequest;
  response: http.IncomingMessage;
};

export interface SimpledownloadOptions {
  timeout?: number;
  agent?: DownloadAgent;
}

/**
 * httpGet - This function handles HTTP GET requests and follows redirects if encountered.
 */
function httpGet(url: string, options: SimpledownloadOptions): Promise<DownloadResult> {
  const urlObj = new URL(url);
  const httpAgent = options.agent;
  const httpLib: typeof http | typeof https = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = httpLib.get(url, { agent: httpAgent }, async (response) => {
      try {
        // follow redirect
        if (isRedirect(response.statusCode) && response.headers.location) {
          const location = response.headers.location
          const redirectUrl = new URL(location, url).toString()
          response.resume()
          request.destroy()
          // recursively follow redirect
          const { request: request2, response: response2 } = await httpGet(redirectUrl, options)
          resolve({ request: request2, response: response2 })
        } else {
          resolve({ request, response })
        }
      } catch (err) {
        reject(err)
      }
    })

    request.on('error', reject)
  })
}

async function simpledownload(url: string, localPath: string, options: SimpledownloadOptions = {}): Promise<void> {
  const { request, response } = await httpGet(url, options)
  if (!isSuccess(response.statusCode)) {
    response.resume()
    request.destroy()
    throw new HttpStatusCodeError(response.statusCode ?? 0, response.statusMessage, url)
  }

  let file: fs.WriteStream | undefined
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
    .catch(async (err) => {
      // if error, release all resources
      request?.destroy()
      file?.close()
      await delWhenExist(localPath)
      throw err;
    })
}

// if path exists, delete it
async function delWhenExist(path: string): Promise<void> {
  try {
    await fs.promises.unlink(path)
  } catch (e) {
    // do nothing
  }
}

function isRedirect(statusCode: number | undefined): boolean {
  return statusCode !== undefined && statusCode >= 300 && statusCode < 400
}

function isSuccess(statusCode: number | undefined): boolean {
  return statusCode !== undefined && statusCode >= 200 && statusCode < 300
}

export { simpledownload }
export * from './errors'

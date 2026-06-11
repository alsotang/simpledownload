import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { simpledownload, HttpStatusCodeError, TimeoutError } from '../src/index'

const fileContent = 'downloaded'
const tmpDir = os.tmpdir()

function createFixtureServer(): http.Server {
  return http.createServer((req, res) => {
    if (req.url === '/redirect') {
      res.statusCode = 302
      res.setHeader('Location', '/file')
      res.end()
      return
    }

    if (req.url === '/any-3xx-redirect') {
      res.statusCode = 300
      res.setHeader('Location', '/file')
      res.end()
      return
    }

    if (req.url === '/missing') {
      res.statusCode = 404
      res.statusMessage = 'Not Found'
      res.end('missing')
      return
    }

    if (req.url === '/slow') {
      res.write('partial')
      setTimeout(() => res.end(fileContent), 200)
      return
    }

    res.statusCode = 200
    res.end(fileContent)
  })
}

function listenOnLocalhost(server: http.Server): Promise<AddressInfo> {
  return new Promise((resolve, reject) => {
    const onError = (err: Error) => {
      server.off('listening', onListening)
      reject(err)
    }

    const onListening = () => {
      server.off('error', onError)

      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('test server did not return a TCP address'))
        return
      }

      resolve(address)
    }

    server.once('error', onError)
    server.listen(0, '127.0.0.1', onListening)
  })
}

function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err?: Error) => err ? reject(err) : resolve())
  })
}

async function withFixtureServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createFixtureServer()
  const address = await listenOnLocalhost(server)

  try {
    return await fn(`http://127.0.0.1:${address.port}`)
  } finally {
    await closeServer(server)
  }
}

function tempFile(name: string): string {
  return path.join(tmpDir, `simpledownload-${process.pid}-${name}`)
}

function isEnoent(err: unknown): boolean {
  return err instanceof Error
    && 'code' in err
    && err.code === 'ENOENT'
}

test('should download a file', async () => {
  await withFixtureServer(async (baseUrl) => {
    const localPath = tempFile('download.txt')
    await simpledownload(`${baseUrl}/file`, localPath)

    const content = await fs.promises.readFile(localPath, 'utf8')
    assert.equal(content, fileContent)

    await fs.promises.unlink(localPath)
  })
})

test('should download with custom agent', async () => {
  await withFixtureServer(async (baseUrl) => {
    const localPath = tempFile('custom-agent.txt')
    await simpledownload(`${baseUrl}/file`, localPath, {
      agent: new http.Agent(),
    })

    const content = await fs.promises.readFile(localPath, 'utf8')
    assert.equal(content, fileContent)

    await fs.promises.unlink(localPath)
  })
})

test('should handle timeout', async () => {
  await withFixtureServer(async (baseUrl) => {
    const localPath = tempFile('timeout.txt')
    const timeout = 50

    await assert.rejects(
      simpledownload(`${baseUrl}/slow`, localPath, { timeout }),
      TimeoutError,
    )
    await assert.rejects(fs.promises.stat(localPath), isEnoent)
  })
})

test('should throw when localPath does not exist', async () => {
  await withFixtureServer(async (baseUrl) => {
    const localPath = path.join(tmpDir, 'simpledownload-not-exist', 'file.txt')

    await assert.rejects(
      simpledownload(`${baseUrl}/file`, localPath),
      isEnoent,
    )
  })
})

test('should follow redirect', async () => {
  await withFixtureServer(async (baseUrl) => {
    const localPath = tempFile('redirect.txt')
    await simpledownload(`${baseUrl}/redirect`, localPath)

    const content = await fs.promises.readFile(localPath, 'utf8')
    assert.equal(content, fileContent)

    await fs.promises.unlink(localPath)
  })
})

test('should follow any 3xx response with location', async () => {
  await withFixtureServer(async (baseUrl) => {
    const localPath = tempFile('any-3xx-redirect.txt')
    await simpledownload(`${baseUrl}/any-3xx-redirect`, localPath)

    const content = await fs.promises.readFile(localPath, 'utf8')
    assert.equal(content, fileContent)

    await fs.promises.unlink(localPath)
  })
})

test('should reject with status code when response is not successful', async () => {
  await withFixtureServer(async (baseUrl) => {
    const localPath = tempFile('missing.txt')

    await assert.rejects(
      simpledownload(`${baseUrl}/missing`, localPath),
      (err: unknown): boolean => {
        assert.ok(err instanceof HttpStatusCodeError)
        assert.equal(err.name, 'HttpStatusCodeError')
        assert.equal(err.statusCode, 404)
        assert.equal(err.statusMessage, 'Not Found')
        return true
      },
    )
    await assert.rejects(fs.promises.stat(localPath), isEnoent)
  })
})

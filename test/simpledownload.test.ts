import {simpledownload, TimeoutError} from '..'
import fs from 'fs'
import https from 'https'
import os from 'os'
import path from 'path'

const imageUrl = 'https://www.google.co.jp/images/srpr/logo11w.png'
const nodejsInstall = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0.pkg'
// will be redirected to https://nodejs.org/en/
const urlWithRedirect = 'http://nodejs.org/en'

const tmpDir = os.tmpdir()

test('should download a svg', async () => {
  const localPath = path.join(tmpDir, 'test1.png')
  await simpledownload(imageUrl, localPath)

  const stat = await fs.promises.stat(localPath)

  expect(stat.size).toBe(12775)
});

test('should download a svg with custom agent', async () => {
  const localPath = path.join(tmpDir, 'test2.png')
  await simpledownload(imageUrl, localPath, {
    agent: new https.Agent(),
  })

  const stat = await fs.promises.stat(localPath)

  expect(stat.size).toBe(12775)
});

test('should handle timeout', async () => {
  const localPath = path.join(tmpDir, 'test3.png')
  const timeout = 50;
  await expect(simpledownload(nodejsInstall, localPath, {timeout})).rejects.toThrow(TimeoutError);
  await expect(fs.promises.stat(localPath)).rejects.toThrow('ENOENT');
});

test('should throw when localPath does not exist', async () => {
  const localPath = path.join(tmpDir, 'not', 'exist', 'test4.png')

  await expect(simpledownload(imageUrl, localPath)).rejects.toThrow('ENOENT');
});

test('should follow redirect', async () => {
  const localPath = path.join(tmpDir, 'test5.html')
  await simpledownload(urlWithRedirect, localPath)

  const stat = await fs.promises.stat(localPath)

  // if greater than 10_000, it's a valid html
  expect(stat.size).toBeGreaterThan(10_000)
})
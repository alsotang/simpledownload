import {simpledownload, TimeoutError} from '..'
import fs from 'fs'
import https from 'https'
import os from 'os'
import path from 'path'

const imageUrl = 'https://www.google.co.jp/images/srpr/logo11w.png'
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
  const timeout = 10; // 10ms
  await expect(simpledownload(imageUrl, localPath, {timeout})).rejects.toThrow(TimeoutError);
  await expect(fs.promises.stat(localPath)).rejects.toThrow('ENOENT');
});

test('should throw when localPath does not exist', async () => {
  const localPath = path.join(tmpDir, 'not', 'exist', 'test4.png')

  await expect(simpledownload(imageUrl, localPath)).rejects.toThrow('ENOENT');
});

test.skip('should follow redirect', async () => {
  const localPath = path.join(tmpDir, 'test5.png')
  await simpledownload('https://url_with_redirect', localPath)

  const stat = await fs.promises.stat(localPath)

  expect(stat.size).toBe(522831)
})
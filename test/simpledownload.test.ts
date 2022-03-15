import {simpledownload, TimeoutError} from '..'
import fs from 'fs'
import https from 'https'

const imageUrl = 'https://www.google.co.jp/images/srpr/logo11w.png'

test('should download a svg', async () => {
  const localPath = '/tmp/test1.png'
  await simpledownload(imageUrl, localPath)

  const stat = await fs.promises.stat(localPath)

  expect(stat.size).toBe(12775)
});

test('should download a svg with custom agent', async () => {
  const localPath = '/tmp/test1.png'
  await simpledownload(imageUrl, localPath, {
    agent: new https.Agent(),
  })

  const stat = await fs.promises.stat(localPath)

  expect(stat.size).toBe(12775)
});

test('should handle timeout', async () => {
  const localPath = '/tmp/test2.png'
  const timeout = 5; // 5ms
  await expect(simpledownload(imageUrl, localPath, {timeout})).rejects.toThrow(TimeoutError);
  await expect(fs.promises.stat(localPath)).rejects.toThrow('ENOENT');
});

test('should throw when localPath does not exist', async () => {
  const localPath = '/tmp/not/exist/test3.png'

  await expect(simpledownload(imageUrl, localPath)).rejects.toThrow('ENOENT');
});
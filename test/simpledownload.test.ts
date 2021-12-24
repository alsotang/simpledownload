import simpledownload, {TimeoutError} from '..'
import fs from 'fs'

const imageUrl = 'https://www.google.co.jp/images/srpr/logo11w.png'

test('should download a svg', async () => {
  const localPath = '/tmp/test1.png'
  await simpledownload(imageUrl, localPath)

  const stat = await fs.promises.stat(localPath)

  expect(stat.size).toBe(12775)
});

test('should handle timeout', async () => {
  const localPath = '/tmp/test2.png'
  const timeout = 5; // 5ms
  expect(simpledownload(imageUrl, localPath, {timeout})).rejects.toThrow(TimeoutError);
});

test('should throw when localPath does not exist', async () => {
  const localPath = '/tmp/not/exist/test3.png'

  expect(simpledownload(imageUrl, localPath)).rejects.toThrow('ENOENT');
});
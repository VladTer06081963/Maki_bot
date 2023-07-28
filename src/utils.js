import { unlink } from 'fs/promises';

export async function removeFile(path) {
  await unlink(path);
}

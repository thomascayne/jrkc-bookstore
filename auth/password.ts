import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const derivedKeyLength = 64;
const scryptCost = 32_768;
const scryptParallelization = 1;
const scryptBlockSize = 8;

function derivePasswordKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      derivedKeyLength,
      {
        N: scryptCost,
        maxmem: 64 * 1024 * 1024,
        p: scryptParallelization,
        r: scryptBlockSize,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await derivePasswordKey(password, salt);

  return [
    'scrypt',
    scryptCost,
    scryptBlockSize,
    scryptParallelization,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$');
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, cost, blockSize, parallelization, saltValue, hashValue] =
    encodedHash.split('$');

  if (
    algorithm !== 'scrypt' ||
    Number(cost) !== scryptCost ||
    Number(blockSize) !== scryptBlockSize ||
    Number(parallelization) !== scryptParallelization ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  const expectedHash = Buffer.from(hashValue, 'base64url');
  if (expectedHash.length !== derivedKeyLength) {
    return false;
  }

  const actualHash = await derivePasswordKey(
    password,
    Buffer.from(saltValue, 'base64url'),
  );

  return timingSafeEqual(actualHash, expectedHash);
}

import "server-only"

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"

const PASSWORD_HASH_VERSION = "s1"
const SALT_LENGTH = 16
const KEY_LENGTH = 64
const SCRYPT_OPTIONS = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
}

function toBase64Url(buffer: Buffer) {
  return buffer.toString("base64url")
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url")
}

async function deriveKey(password: string, salt: Buffer) {
  return await new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey as Buffer)
    })
  })
}

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH)
  const derivedKey = await deriveKey(password, salt)
  return `${PASSWORD_HASH_VERSION}$${toBase64Url(salt)}$${toBase64Url(derivedKey)}`
}

export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined,
) {
  if (!storedHash) {
    return false
  }

  const [version, saltValue, hashValue] = storedHash.split("$")

  if (version !== PASSWORD_HASH_VERSION || !saltValue || !hashValue) {
    return false
  }

  const salt = fromBase64Url(saltValue)
  const expectedHash = fromBase64Url(hashValue)
  const candidateHash = await deriveKey(password, salt)

  if (candidateHash.length !== expectedHash.length) {
    return false
  }

  return timingSafeEqual(candidateHash, expectedHash)
}

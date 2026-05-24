import { randomBytes, scrypt as scryptCallback } from "node:crypto"

const PASSWORD_HASH_VERSION = "s1"
const SALT_LENGTH = 16
const KEY_LENGTH = 64
const SCRYPT_OPTIONS = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
}

function toBase64Url(buffer) {
  return buffer.toString("base64url")
}

async function deriveKey(password, salt) {
  return await new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey)
    })
  })
}

const password = process.argv[2]

if (!password || password.length < 8) {
  console.error('Usage: npm run admin:hash -- "motdepassefort"')
  process.exit(1)
}

const salt = randomBytes(SALT_LENGTH)
const derivedKey = await deriveKey(password, salt)
const formatted = `${PASSWORD_HASH_VERSION}$${toBase64Url(salt)}$${toBase64Url(derivedKey)}`

console.log("Password hash:")
console.log(formatted)
console.log("")
console.log("SQL example:")
console.log(
  `update users set role = 'ADMIN', password_hash = '${formatted}', statut = 'active' where email = 'admin@gavroche.tn';`,
)

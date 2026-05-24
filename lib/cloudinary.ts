import "server-only"

function getCloudinaryEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name} in .env.local`)
  }

  return value
}

export async function uploadImageToCloudinary(file: File) {
  const cloudName = getCloudinaryEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")
  const apiKey = getCloudinaryEnv("CLOUDINARY_API_KEY")
  const apiSecret = getCloudinaryEnv("CLOUDINARY_API_SECRET")
  const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "seafood/admin"

  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=${uploadFolder}&timestamp=${timestamp}${apiSecret}`

  const signatureBuffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(paramsToSign),
  )

  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", apiKey)
  formData.append("timestamp", String(timestamp))
  formData.append("folder", uploadFolder)
  formData.append("signature", signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  )

  const payload = (await response.json().catch(() => null)) as
    | { secure_url?: string; error?: { message?: string } }
    | null

  if (!response.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message ?? "Cloudinary upload failed")
  }

  return payload.secure_url
}

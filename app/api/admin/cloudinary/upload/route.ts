import { requireAdminApiSession } from "@/lib/auth/guards"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

export async function POST(request: Request) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      throw new HttpError(400, "Image file is required")
    }

    if (!file.type.startsWith("image/")) {
      throw new HttpError(400, "Only image uploads are allowed")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new HttpError(400, "Image exceeds the 5 MB limit")
    }

    const url = await uploadImageToCloudinary(file)

    return { data: { url }, status: 201 }
  })
}

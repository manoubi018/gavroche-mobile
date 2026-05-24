import { HttpError } from "@/lib/errors/http-error"

import { productRepository } from "@/features/products/repository"
import { categoryRepository } from "./repository"
import type { CreateCategoryInput, DeleteCategoryInput, UpdateCategoryInput } from "./types"

export class CategoryService {
  async getCategories() {
    return categoryRepository.findAll()
  }

  async getCategoryById(id: number) {
    const category = await categoryRepository.findById(id)
    if (!category) {
      throw new HttpError(404, "Category not found")
    }
    return category
  }

  async createCategory(input: CreateCategoryInput) {
    return categoryRepository.create(input)
  }

  async updateCategory(id: number, input: UpdateCategoryInput) {
    const category = await categoryRepository.update(id, input)
    if (!category) {
      throw new HttpError(404, "Category not found")
    }
    return category
  }

  async deleteCategory(id: number, input: DeleteCategoryInput) {
    const category = await categoryRepository.findById(id)
    if (!category) {
      throw new HttpError(404, "Category not found")
    }

    const products = await productRepository.findByCategoryId(id)

    if (products.length > 0 && input.mode === "move-products") {
      const replacementCategoryId = input.replacementCategoryId

      if (replacementCategoryId === id) {
        throw new HttpError(400, "Replacement category must be different")
      }

      const replacement = await categoryRepository.findById(replacementCategoryId)
      if (!replacement) {
        throw new HttpError(404, "Replacement category not found")
      }

      await productRepository.moveCategory(id, replacementCategoryId)
    }

    if (products.length > 0 && input.mode === "delete-products") {
      await productRepository.deleteByCategoryId(id)
    }

    const deleted = await categoryRepository.delete(id)
    if (!deleted) {
      throw new HttpError(404, "Category not found")
    }

    return { success: true }
  }
}

export const categoryService = new CategoryService()

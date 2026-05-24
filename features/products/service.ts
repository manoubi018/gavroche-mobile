import { HttpError } from "@/lib/errors/http-error"

import { productRepository } from "./repository"
import type { CreateProductInput, UpdateProductInput } from "./types"

export class ProductService {
  async getProducts() {
    return productRepository.findAll()
  }

  async getProductById(id: number) {
    const product = await productRepository.findById(id)
    if (!product) {
      throw new HttpError(404, "Product not found")
    }
    return product
  }

  async createProduct(input: CreateProductInput) {
    return productRepository.create(input)
  }

  async updateProduct(id: number, input: UpdateProductInput) {
    const product = await productRepository.update(id, input)
    if (!product) {
      throw new HttpError(404, "Product not found")
    }
    return product
  }

  async deleteProduct(id: number) {
    const deleted = await productRepository.delete(id)
    if (!deleted) {
      throw new HttpError(404, "Product not found")
    }
  }

  async disableProduct(id: number) {
    const product = await productRepository.setActive(id, false)
    if (!product) {
      throw new HttpError(404, "Product not found")
    }
    return product
  }
}

export const productService = new ProductService()

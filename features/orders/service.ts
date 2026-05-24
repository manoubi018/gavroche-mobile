import { HttpError } from "@/lib/errors/http-error"

import { orderRepository } from "./repository"
import type { CreateOrderInput, StatusCommande } from "./types"

interface GetOrdersFilters {
  userId?: number
  telephone?: string
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const order = await orderRepository.create(input)
    if (!order) {
      throw new HttpError(500, "Could not create order")
    }
    return order
  }

  async getOrders(filters?: GetOrdersFilters) {
    return orderRepository.findAll(filters)
  }

  async getOrderById(id: number) {
    const order = await orderRepository.findById(id)
    if (!order) {
      throw new HttpError(404, "Order not found")
    }
    return order
  }

  async updateOrderStatus(id: number, status: StatusCommande) {
    const order = await orderRepository.updateStatus(id, status)
    if (!order) {
      throw new HttpError(404, "Order not found")
    }
    return order
  }

  async deleteOrder(id: number) {
    const deleted = await orderRepository.delete(id)
    if (!deleted) {
      throw new HttpError(404, "Order not found")
    }
  }
}

export const orderService = new OrderService()

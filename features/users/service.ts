import { HttpError } from "@/lib/errors/http-error"

import { userRepository } from "./repository"
import type { CreateUserInput, UpdateUserInput } from "./types"

export class UserService {
  async getUsers() {
    return userRepository.findAll()
  }

  async getUserByEmail(email: string) {
    return userRepository.findByEmail(email)
  }

  async getUserByTelephone(telephone: string) {
    return userRepository.findByTelephone(telephone)
  }

  async getUserById(id: number) {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new HttpError(404, "User not found")
    }
    return user
  }

  async createUser(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      throw new HttpError(409, "Email already exists")
    }

    const user = await userRepository.create(input)
    if (!user) {
      throw new HttpError(500, "Could not create user")
    }
    return user
  }

  async updateUser(id: number, input: UpdateUserInput) {
    const user = await userRepository.update(id, input)
    if (!user) {
      throw new HttpError(404, "User not found")
    }
    return user
  }

  async deleteUser(id: number) {
    const deleted = await userRepository.delete(id)
    if (!deleted) {
      throw new HttpError(404, "User not found")
    }
  }

  async disableUser(id: number) {
    const user = await userRepository.setStatus(id, "disabled")
    if (!user) {
      throw new HttpError(404, "User not found")
    }
    return user
  }
}

export const userService = new UserService()

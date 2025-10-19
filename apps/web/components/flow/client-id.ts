"use client"
import { v4 as uuid } from "uuid"
const k = "currentReturnId"
export function getOrCreateReturnId() {
  if (typeof window === "undefined") return uuid()
  let id = localStorage.getItem(k)
  if (!id) {
    id = uuid()
    localStorage.setItem(k, id)
  }
  return id
}

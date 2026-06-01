"use client"

import { useEffect, useRef } from "react"

type AdminNotification = {
  id: number
  orderId: number | null
  title: string
  body: string
}

async function markRead(ids: number[]) {
  if (ids.length === 0) {
    return
  }

  await fetch("/api/admin/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  }).catch(() => undefined)
}

export function AdminNotificationListener() {
  const seenIdsRef = useRef(new Set<number>())

  useEffect(() => {
    let cancelled = false

    async function requestPermission() {
      if (!("Notification" in window) || Notification.permission !== "default") {
        return
      }

      await Notification.requestPermission().catch(() => undefined)
    }

    async function showNotification(notification: AdminNotification) {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return
      }

      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        tag: `order-${notification.orderId ?? notification.id}`,
        icon: "/icon-light-32x32.png",
      })

      browserNotification.onclick = () => {
        window.focus()
        if (notification.orderId) {
          window.location.href = `/dashboard/orders?orderId=${notification.orderId}`
        }
      }
    }

    async function pollNotifications() {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" }).catch(
        () => null,
      )

      if (!response?.ok || cancelled) {
        return
      }

      const notifications = (await response.json().catch(() => [])) as AdminNotification[]
      const freshNotifications = notifications.filter(
        (notification) => !seenIdsRef.current.has(notification.id),
      )

      if (freshNotifications.length === 0) {
        return
      }

      await requestPermission()

      for (const notification of freshNotifications) {
        seenIdsRef.current.add(notification.id)
        await showNotification(notification)
      }

      await markRead(freshNotifications.map((notification) => notification.id))
    }

    void pollNotifications()
    const intervalId = window.setInterval(() => {
      void pollNotifications()
    }, 15000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  return null
}

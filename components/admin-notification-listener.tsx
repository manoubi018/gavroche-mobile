"use client"

import { useEffect, useRef } from "react"

type AdminNotification = {
  id: number
  orderId: number | null
  title: string
  body: string
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i)
  }

  return output
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
    const vapidPublicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY

    async function requestPermission() {
      if (!("Notification" in window) || Notification.permission !== "default") {
        return Notification.permission
      }

      return Notification.requestPermission().catch(() => "default" as NotificationPermission)
    }

    async function registerPushSubscription() {
      if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        return
      }

      const permission = await requestPermission()
      if (permission !== "granted") {
        return
      }

      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }))

      await fetch("/api/admin/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      }).catch(() => undefined)
    }

    async function showNotification(notification: AdminNotification) {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return false
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

      return true
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

      const displayedNotificationIds: number[] = []

      for (const notification of freshNotifications) {
        seenIdsRef.current.add(notification.id)
        const displayed = await showNotification(notification)

        if (displayed) {
          displayedNotificationIds.push(notification.id)
        }
      }

      await markRead(displayedNotificationIds)
    }

    void registerPushSubscription()
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

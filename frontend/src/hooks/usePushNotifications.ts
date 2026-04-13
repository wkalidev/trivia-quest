"use client";

import { useState, useEffect } from "react";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported("Notification" in window && "serviceWorker" in navigator);
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const sendLocalNotification = (title: string, body: string, url = "/checkin") => {
    if (permission !== "granted") return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/icon-192.png",
        data: { url },
      });
    });
  };

  // Schedule daily check-in reminder
  const scheduleDailyReminder = () => {
    if (permission !== "granted") return;
    // Notification locale après 24h
    setTimeout(() => {
      sendLocalNotification(
        "TriviaQ 🔥 Daily Check-in",
        "Your check-in is ready! Earn 100 TRIVQ + NFT badge now.",
        "/checkin"
      );
    }, 24 * 60 * 60 * 1000);
  };

  return { permission, isSupported, requestPermission, sendLocalNotification, scheduleDailyReminder };
}
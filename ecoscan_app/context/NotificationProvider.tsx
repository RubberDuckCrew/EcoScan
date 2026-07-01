import { useSseClient } from "@/utils/sseClient";
import * as Notifications from "expo-notifications";
import React, { useEffect } from "react";
import { LogBox, Platform } from "react-native";

// Bestimmt, wie die App reagiert, wenn eine Benachrichtigung im Vordergrund empfangen wird
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type NotificationItem = {
  title: string;
  message: string;
  timestamp: string;
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { startStream, closeStream } = useSseClient<NotificationItem>("notification");

  LogBox.ignoreLogs([
    "expo-notifications` functionality is not fully supported in Expo Go",
    "Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go",
  ]);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default_v2", {
          name: "Default V2",
          importance: Notifications.AndroidImportance.HIGH,
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    })();
  }, []);

  useEffect(() => {
    startStream(
      "notification/stream",
      (notification) => {
        void Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.message,
            ...Platform.select({
              android: { channelId: "default_v2" }
            })
          },
          trigger: null,
        });
      },
      () => {},
    );
    return () => closeStream();
  }, [startStream, closeStream]);

  return <>{children}</>;
}
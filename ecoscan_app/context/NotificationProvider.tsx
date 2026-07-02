import { useSseClient } from "@/utils/sseClient";
import * as Notifications from "expo-notifications";
import { Href, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

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
  url?: string;
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { startStream, closeStream } =
    useSseClient<NotificationItem>("notification");

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
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url;

        if (url) {
          router.push(url as Href);
        }
      },
    );

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    startStream(
      "notification/stream",
      (notification) => {
        if (!notification.title || !notification.message) return;
        void Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.message,
            data: { url: notification.url },
            ...Platform.select({
              android: { channelId: "default_v2" },
            }),
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

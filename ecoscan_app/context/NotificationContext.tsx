import { useApiClient } from "@/utils/apiClient";
import { useSseClient } from "@/utils/sseClient";
import * as Notifications from "expo-notifications";
import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { LogBox, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type NotificationItem = {
  title: string;
  message: string;
  timestamp: string;
};

type NotificationContextType = {
  sendTestNotification: (title: string, message: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const api = useApiClient();
  const { startStream, closeStream } =
    useSseClient<NotificationItem>("notification");

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
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    })();
  }, []);

  useEffect(() => {
    startStream(
      "notification/stream",
      (notification) => {
        void Notifications.scheduleNotificationAsync({
          content: { title: notification.title, body: notification.message },
          trigger: null,
        });
      },
      () => {},
    );
    return () => closeStream();
  }, [startStream, closeStream]);

  const sendTestNotification = useCallback(
    async (title: string, message: string) => {
      await api.post("notification/send", { title, message });
    },
    [api],
  );

  const value = useMemo(
    () => ({ sendTestNotification }),
    [sendTestNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  return ctx;
}

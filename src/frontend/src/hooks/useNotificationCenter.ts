import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { StoreNotif } from "../sequeApi";
import { sequeApi } from "../sequeApi";

export function useNotificationCenter(storeId: string) {
  const queryClient = useQueryClient();
  const seenIdsRef = useRef<Set<string>>(new Set());

  const notifsQuery = useQuery({
    queryKey: ["store-notifs", storeId],
    queryFn: () =>
      storeId ? sequeApi.getStoreNotifs(storeId) : Promise.resolve([]),
    enabled: !!storeId,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => sequeApi.markStoreNotifsRead(storeId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["store-notifs", storeId] }),
  });

  const notifications: StoreNotif[] = notifsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Show browser notification for new unread ones
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const unread = notifications.filter((n) => !n.read);
    for (const notif of unread) {
      if (seenIdsRef.current.has(notif.id)) continue;
      seenIdsRef.current.add(notif.id);

      // Only show browser notification if not first load (avoid spam on login)
      if (seenIdsRef.current.size > unread.length) {
        new Notification("SÉQUÉ-APP", {
          body: notif.message,
          icon: "/favicon.ico",
        });
      }
    }
    // Mark initial set as seen without showing browser notification
    if (seenIdsRef.current.size === 0) {
      for (const n of notifications) seenIdsRef.current.add(n.id);
    }
  }, [notifications]);

  const showBrowserNotification = (message: string) => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      new Notification("SÉQUÉ-APP", {
        body: message,
        icon: "/favicon.ico",
      });
    }
  };

  return {
    notifications,
    unreadCount,
    markAllRead: () => markReadMutation.mutate(),
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ["store-notifs", storeId] }),
    showBrowserNotification,
  };
}

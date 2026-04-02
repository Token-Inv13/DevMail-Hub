import { useCallback, useRef, useState } from 'react';

export type NotificationTone = 'success' | 'error' | 'info';

export type Notification = {
  id: string;
  message: string;
  tone: NotificationTone;
};

type ShowNotificationInput = {
  message: string;
  tone?: NotificationTone;
  durationMs?: number;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutRefs = useRef<Map<string, number>>(new Map());

  const dismissNotification = useCallback((id: string) => {
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }

    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const showNotification = useCallback(
    ({ message, tone = 'info', durationMs = 4000 }: ShowNotificationInput) => {
      const id = Math.random().toString(36).slice(2, 11);
      setNotifications((current) => [...current, { id, message, tone }]);

      const timeoutId = window.setTimeout(() => {
        dismissNotification(id);
      }, durationMs);

      timeoutRefs.current.set(id, timeoutId);
    },
    [dismissNotification],
  );

  return {
    dismissNotification,
    notifications,
    showNotification,
  };
}

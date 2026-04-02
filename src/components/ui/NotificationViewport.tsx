import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { Notification } from '../../hooks/useNotifications';
import { cn } from '../../lib/utils';

type NotificationViewportProps = {
  notifications: Notification[];
  onDismiss: (id: string) => void;
};

const notificationStyles = {
  error: {
    icon: XCircle,
    iconClassName: 'text-red-400',
    panelClassName: 'border-red-500/20 bg-red-500/10',
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-400',
    panelClassName: 'border-blue-500/20 bg-blue-500/10',
  },
  success: {
    icon: CheckCircle2,
    iconClassName: 'text-green-400',
    panelClassName: 'border-green-500/20 bg-green-500/10',
  },
} as const;

export function NotificationViewport({ notifications, onDismiss }: NotificationViewportProps) {
  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {notifications.map((notification) => {
        const { icon: Icon, iconClassName, panelClassName } = notificationStyles[notification.tone];

        return (
          <div key={notification.id} className={cn('rounded-2xl border p-4 shadow-2xl backdrop-blur-sm', panelClassName)}>
            <div className="flex items-start gap-3">
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClassName)} />
              <p className="flex-1 text-sm text-zinc-100">{notification.message}</p>
              <button
                onClick={() => onDismiss(notification.id)}
                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-black/20 hover:text-zinc-200"
                aria-label="Fermer la notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

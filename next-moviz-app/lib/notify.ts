import { toast } from 'sonner';

export type AppNotification = {
  title: string;
  description?: string;
};

export function notify(notification: AppNotification) {
  toast(notification.title, {
    description: notification.description,
    duration: 2400,
  });
}

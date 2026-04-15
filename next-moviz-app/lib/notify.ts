export type AppNotification = {
  title: string;
  description?: string;
};

const EVENT_NAME = 'vidoza:notify';

export function notify(notification: AppNotification) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AppNotification>(EVENT_NAME, { detail: notification }));
}

export function getNotificationEventName() {
  return EVENT_NAME;
}

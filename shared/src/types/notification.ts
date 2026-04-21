import type { NotificationType } from "../constants/events";

/**
 * A persisted notification — safe to render verbatim in the UI.
 * `link` is a local path so the dropdown can route immediately on click.
 */
export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

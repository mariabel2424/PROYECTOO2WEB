'use client';

import { useState } from 'react';

// Hook simplificado - notificaciones no implementadas en este sistema
export function useNotifications() {
  const [notifications] = useState<never[]>([]);
  const [unreadCount] = useState(0);
  const [isLoading] = useState(false);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    deleteNotification: async () => {},
    refetch: async () => {},
  };
}

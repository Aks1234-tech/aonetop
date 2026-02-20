/**
 * Notification System Hooks
 * React hooks for managing notifications in the application
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { notificationService } from '../lib/notificationService';
import type { NotificationType, NotificationChannel } from '../lib/notificationService';

/**
 * Hook: Manage user notification preferences
 */
export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Record<NotificationType, NotificationChannel[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences on mount
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchPreferences();
  }, [user?.id]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_contact_info')
        .select('notification_preferences')
        .eq('user_id', user?.id)
        .single();

      if (error || !data) throw error;

      const prefs = ((data as any)?.notification_preferences as Record<NotificationType, NotificationChannel[]>) || ({} as Record<NotificationType, NotificationChannel[]>);
      setPreferences(prefs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preferences';
      setError(errorMessage);
      console.error('Error fetching notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update notification preferences for a specific type
   */
  const updatePreference = useCallback(
    async (
      notificationType: NotificationType,
      channels: NotificationChannel[]
    ) => {
      if (!user) return;

      try {
        const updatedPrefs = {
          ...preferences,
          [notificationType]: channels,
        };

        const { error } = await (supabase as any)
          .from('user_contact_info')
          .update({ notification_preferences: updatedPrefs })
          .eq('user_id', user.id);

        if (error) throw error;

        setPreferences(updatedPrefs);
        setError(null);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
        setError(errorMessage);
        console.error('Error updating notification preferences:', err);
        return false;
      }
    },
    [user, preferences]
  );

  /**
   * Toggle channel for a notification type
   */
  const toggleChannel = useCallback(
    async (
      notificationType: NotificationType,
      channel: NotificationChannel
    ) => {
      const currentChannels = preferences?.[notificationType] || [];
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter((c) => c !== channel)
        : [...currentChannels, channel];

      return updatePreference(notificationType, newChannels);
    },
    [preferences, updatePreference]
  );

  /**
   * Unsubscribe from a notification type
   */
  const unsubscribe = useCallback(
    async (notificationType: NotificationType) => {
      if (!user) return false;

      try {
        // Fetch current unsubscribed list
        const { data } = await supabase
          .from('user_contact_info')
          .select('unsubscribed_from')
          .eq('user_id', user.id)
          .single();

        if (!data) throw new Error('User data not found');

        const unsubscribedFrom = (((data as any)?.unsubscribed_from || []) as NotificationType[]);

        // Add if not already unsubscribed
        if (!unsubscribedFrom.includes(notificationType)) {
          unsubscribedFrom.push(notificationType);
        }

        const { error } = await (supabase as any)
          .from('user_contact_info')
          .update({ unsubscribed_from: unsubscribedFrom })
          .eq('user_id', user.id);

        if (error) throw error;

        // Remove from preferences
        const updatedPrefs = { ...preferences };
        delete updatedPrefs[notificationType];
        setPreferences(updatedPrefs);

        return true;
      } catch (err) {
        console.error('Error unsubscribing:', err);
        return false;
      }
    },
    [user, preferences]
  );

  return {
    preferences,
    loading,
    error,
    updatePreference,
    toggleChannel,
    unsubscribe,
    refetch: fetchPreferences,
  };
}

/**
 * Hook: Fetch user notification logs/history
 */
export function useNotificationHistory(limit: number = 20) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchHistory();
  }, [user?.id]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setNotifications(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notification history:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    loading,
    error,
    refetch: fetchHistory,
  };
}

/**
 * Hook: Send test notification
 */
export function useSendNotification() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (
      notificationType: NotificationType,
      channels?: NotificationChannel[]
    ) => {
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await notificationService.send({
          userId: user.id,
          notificationType,
          channels,
        });

        if (result.overallStatus === 'failed') {
          setError('Failed to send notification');
          return false;
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
        setError(errorMessage);
        console.error('Error sending notification:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    send,
    loading,
    error,
  };
}

/**
 * Hook: Monitor notification status
 */
export function useNotificationStatus(notificationId: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!notificationId) {
      return;
    }

    fetchStatus();

    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [notificationId]);

  const fetchStatus = async () => {
    if (!notificationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_logs')
        .select('status')
        .eq('id', notificationId)
        .single();

      if (error || !data) throw error;

      setStatus(((data as any)?.status as string) || null);
    } catch (err) {
      console.error('Error fetching notification status:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    refetch: fetchStatus,
  };
}

export default {
  useNotificationPreferences,
  useNotificationHistory,
  useSendNotification,
  useNotificationStatus,
};

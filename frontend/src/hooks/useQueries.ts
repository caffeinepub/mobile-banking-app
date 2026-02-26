import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { TransactionType } from '../backend';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { useAuthStore } from '../store/authStore';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useRegisterUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      mobile,
      pin,
      name,
    }: {
      mobile: string;
      pin: string;
      name: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const deviceId = getDeviceFingerprint();
      const result = await actor.registerUser(mobile, pin, name, deviceId);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useLoginUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mobile,
      pin,
    }: {
      mobile: string;
      pin: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const deviceId = getDeviceFingerprint();
      const result = await actor.loginUser(mobile, pin, deviceId);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok; // returns userId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetUserTransactions(userId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserTransactions(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      txType,
      amount,
      recipient,
      provider,
    }: {
      userId: string;
      txType: TransactionType;
      amount: number;
      recipient: string;
      provider: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.createTransaction(userId, txType, amount, recipient, provider);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useGetUserNotifications(userId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserNotifications(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notificationId }: { userId: string; notificationId: string }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.markNotificationRead(userId, notificationId);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
}

// ─── Support Tickets ──────────────────────────────────────────────────────────

export function useGetUserTickets(userId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['tickets', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserTickets(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreateSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      subject,
      message,
    }: {
      userId: string;
      subject: string;
      message: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.createSupportTicket(userId, subject, message);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', userId] });
    },
  });
}

// ─── KYC ──────────────────────────────────────────────────────────────────────

export function useSubmitKYC() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      nid,
      fullName,
      address,
      photoUrl,
    }: {
      userId: string;
      nid: string;
      fullName: string;
      address: string;
      photoUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.submitKYC(userId, nid, fullName, address, photoUrl);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useChangePIN() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      userId,
      oldPin,
      newPin,
    }: {
      userId: string;
      oldPin: string;
      newPin: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.changePIN(userId, oldPin, newPin);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

const ADMIN_TOKEN = 'nuralom1:9040';

export function useAdminGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions(ADMIN_TOKEN);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminCompleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (txId: string) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.completeTransaction(ADMIN_TOKEN, txId);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    },
  });
}

export function useAdminCancelTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (txId: string) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.cancelTransaction(ADMIN_TOKEN, txId);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    },
  });
}

export function useAdminGetAllTickets() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTickets(ADMIN_TOKEN);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminReplyToTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, reply }: { ticketId: string; reply: string }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.replyToTicket(ADMIN_TOKEN, ticketId, reply);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
    },
  });
}

export function useAdminCreateAnnouncement() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.createAnnouncement(ADMIN_TOKEN, title, body);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useAdminGetAppSettings() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAppSettings(ADMIN_TOKEN);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSetTransactionSystemEnabled() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.setTransactionSystemEnabled(ADMIN_TOKEN, enabled);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

export function useAdminSetUserBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.setUserBalance(ADMIN_TOKEN, userId, amount);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminApproveKYC() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.approveKYC(ADMIN_TOKEN, userId);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminRejectKYC() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.rejectKYC(ADMIN_TOKEN, userId);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminResetUserDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newDeviceId }: { userId: string; newDeviceId: string }) => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.resetUserDevice(ADMIN_TOKEN, userId, newDeviceId);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// Re-export useAuthStore for convenience
export { useAuthStore };

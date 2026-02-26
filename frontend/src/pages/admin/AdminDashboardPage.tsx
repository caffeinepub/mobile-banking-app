import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Bell,
  HeadphonesIcon,
  LogOut,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  Shield,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  UserCheck,
  UserX,
  Smartphone,
} from 'lucide-react';
import { isAdminAuthenticated, clearAdminToken } from '../../utils/adminAuth';
import {
  useAdminGetAllTransactions,
  useAdminCompleteTransaction,
  useAdminCancelTransaction,
  useAdminGetAllTickets,
  useAdminReplyToTicket,
  useAdminCreateAnnouncement,
  useAdminGetAppSettings,
  useAdminSetTransactionSystemEnabled,
  useAdminSetUserBalance,
  useAdminApproveKYC,
  useAdminRejectKYC,
  useAdminResetUserDevice,
} from '../../hooks/useQueries';
import { TransactionStatus } from '../../backend';

type AdminTab = 'dashboard' | 'transactions' | 'users' | 'txManagement' | 'notifications' | 'support';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate({ to: '/admin' });
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAdminToken();
    navigate({ to: '/admin' });
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'transactions', label: 'TX Control', icon: <ArrowLeftRight size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'txManagement', label: 'TX Manage', icon: <TrendingUp size={18} /> },
    { id: 'notifications', label: 'Notify', icon: <Bell size={18} /> },
    { id: 'support', label: 'Support', icon: <HeadphonesIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Shield size={20} />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-card border-b border-border overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 overflow-auto">
        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'transactions' && <TransactionControl />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'txManagement' && <TransactionManagement />}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'support' && <SupportTickets />}
      </main>
    </div>
  );
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

function DashboardStats() {
  const { data: transactions, isLoading: txLoading } = useAdminGetAllTransactions();
  const { data: tickets, isLoading: ticketsLoading } = useAdminGetAllTickets();
  const { data: settings } = useAdminGetAppSettings();

  const totalTx = transactions?.length || 0;
  const processingTx = transactions?.filter((t) => t.status === TransactionStatus.processing).length || 0;
  const completedTx = transactions?.filter((t) => t.status === TransactionStatus.completed).length || 0;
  const openTickets = tickets?.filter((t) => t.status === 'open').length || 0;

  const stats = [
    { label: 'Total Transactions', value: totalTx, icon: <ArrowLeftRight size={20} />, color: 'text-blue-600' },
    { label: 'Processing', value: processingTx, icon: <RefreshCw size={20} />, color: 'text-yellow-600' },
    { label: 'Completed', value: completedTx, icon: <CheckCircle size={20} />, color: 'text-green-600' },
    { label: 'Open Tickets', value: openTickets, icon: <HeadphonesIcon size={20} />, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Dashboard Overview</h2>

      {settings && (
        <div className={`p-3 rounded-xl flex items-center gap-2 ${settings.transactionSystemEnabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {settings.transactionSystemEnabled ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-medium">
            Transaction System: {settings.transactionSystemEnabled ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-foreground">
              {txLoading || ticketsLoading ? <Loader2 size={20} className="animate-spin" /> : stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-2">Admin Info</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Username: <span className="text-foreground font-medium">nuralom1</span></p>
          <p>Role: <span className="text-primary font-medium">Super Admin</span></p>
          <p>Support: <span className="text-foreground">+8809606945622</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction Control ──────────────────────────────────────────────────────

function TransactionControl() {
  const { data: settings, isLoading } = useAdminGetAppSettings();
  const toggleMutation = useAdminSetTransactionSystemEnabled();

  const handleToggle = async () => {
    if (!settings) return;
    try {
      await toggleMutation.mutateAsync(!settings.transactionSystemEnabled);
    } catch (err: any) {
      console.error('Toggle failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Transaction System Control</h2>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Transaction System</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Enable or disable all transactions</p>
          </div>
          {isLoading ? (
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          ) : (
            <button
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                settings?.transactionSystemEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              } disabled:opacity-60`}
            >
              {toggleMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : settings?.transactionSystemEnabled ? (
                <ToggleRight size={20} />
              ) : (
                <ToggleLeft size={20} />
              )}
              {settings?.transactionSystemEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          )}
        </div>

        <div className={`p-3 rounded-lg text-sm ${settings?.transactionSystemEnabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {settings?.transactionSystemEnabled
            ? '✅ Users can currently create transactions'
            : '🚫 All transactions are currently blocked'}
        </div>
      </div>
    </div>
  );
}

// ─── User Management ──────────────────────────────────────────────────────────

function UserManagement() {
  const setBalanceMutation = useAdminSetUserBalance();
  const approveKYCMutation = useAdminApproveKYC();
  const rejectKYCMutation = useAdminRejectKYC();
  const resetDeviceMutation = useAdminResetUserDevice();

  const [userId, setUserId] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAction = async (action: () => Promise<unknown>) => {
    setMessage('');
    setError('');
    try {
      await action();
      setMessage('Action completed successfully!');
    } catch (err: any) {
      setError(err?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">User Management</h2>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. u1"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {message && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-green-700 text-sm">
            <CheckCircle size={14} />
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-destructive text-sm">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      {/* Set Balance */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <DollarSign size={16} /> Set User Balance
        </h3>
        <input
          type="number"
          value={balanceAmount}
          onChange={(e) => setBalanceAmount(e.target.value)}
          placeholder="Amount in BDT"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() =>
            handleAction(() =>
              setBalanceMutation.mutateAsync({ userId, amount: parseFloat(balanceAmount) })
            )
          }
          disabled={!userId || !balanceAmount || setBalanceMutation.isPending}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {setBalanceMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
          Set Balance
        </button>
      </div>

      {/* KYC Actions */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <UserCheck size={16} /> KYC Management
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction(() => approveKYCMutation.mutateAsync(userId))}
            disabled={!userId || approveKYCMutation.isPending}
            className="py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1"
          >
            {approveKYCMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
            Approve KYC
          </button>
          <button
            onClick={() => handleAction(() => rejectKYCMutation.mutateAsync(userId))}
            disabled={!userId || rejectKYCMutation.isPending}
            className="py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1"
          >
            {rejectKYCMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
            Reject KYC
          </button>
        </div>
      </div>

      {/* Reset Device */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Smartphone size={16} /> Reset Device ID
        </h3>
        <input
          type="text"
          value={newDeviceId}
          onChange={(e) => setNewDeviceId(e.target.value)}
          placeholder="New Device ID (leave blank for auto)"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() =>
            handleAction(() =>
              resetDeviceMutation.mutateAsync({
                userId,
                newDeviceId: newDeviceId || 'reset_' + Date.now(),
              })
            )
          }
          disabled={!userId || resetDeviceMutation.isPending}
          className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {resetDeviceMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Smartphone size={14} />}
          Reset Device
        </button>
      </div>
    </div>
  );
}

// ─── Transaction Management ───────────────────────────────────────────────────

function TransactionManagement() {
  const { data: transactions, isLoading } = useAdminGetAllTransactions();
  const completeMutation = useAdminCompleteTransaction();
  const cancelMutation = useAdminCancelTransaction();
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  const handleComplete = async (txId: string) => {
    try {
      await completeMutation.mutateAsync(txId);
      setActionMsg({ id: txId, msg: 'Transaction completed!', type: 'success' });
    } catch (err: any) {
      setActionMsg({ id: txId, msg: err?.message || 'Failed', type: 'error' });
    }
  };

  const handleCancel = async (txId: string) => {
    try {
      await cancelMutation.mutateAsync(txId);
      setActionMsg({ id: txId, msg: 'Transaction cancelled & refunded!', type: 'success' });
    } catch (err: any) {
      setActionMsg({ id: txId, msg: err?.message || 'Failed', type: 'error' });
    }
  };

  const statusColor = (status: string) => {
    if (status === 'processing') return 'bg-yellow-100 text-yellow-700';
    if (status === 'completed') return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Transaction Management</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : !transactions?.length ? (
        <div className="text-center py-8 text-muted-foreground">No transactions found</div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">#{tx.id}</p>
                    <p className="text-xs text-muted-foreground">৳{tx.amount.toFixed(2)} • {tx.txType}</p>
                  </div>
                </div>
                {expandedTx === tx.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedTx === tx.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>User ID: <span className="text-foreground">{tx.userId}</span></p>
                    <p>Recipient: <span className="text-foreground">{tx.recipient || '—'}</span></p>
                    <p>Provider: <span className="text-foreground">{tx.provider || '—'}</span></p>
                  </div>

                  {actionMsg?.id === tx.id && (
                    <div className={`p-2 rounded-lg text-sm flex items-center gap-2 ${actionMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {actionMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {actionMsg.msg}
                    </div>
                  )}

                  {tx.status === TransactionStatus.processing && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleComplete(tx.id)}
                        disabled={completeMutation.isPending}
                        className="py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {completeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Complete
                      </button>
                      <button
                        onClick={() => handleCancel(tx.id)}
                        disabled={cancelMutation.isPending}
                        className="py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {cancelMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Panel ──────────────────────────────────────────────────────

function NotificationsPanel() {
  const createMutation = useAdminCreateAnnouncement();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await createMutation.mutateAsync({ title, body });
      setMessage('Announcement sent successfully!');
      setTitle('');
      setBody('');
    } catch (err: any) {
      setError(err?.message || 'Failed to send announcement');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Send Announcement</h2>

      <div className="bg-card border border-border rounded-xl p-4">
        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Announcement message..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {message && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-green-700 text-sm">
              <CheckCircle size={14} />
              {message}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-destructive text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!title || !body || createMutation.isPending}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send Announcement
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Support Tickets ──────────────────────────────────────────────────────────

function SupportTickets() {
  const { data: tickets, isLoading } = useAdminGetAllTickets();
  const replyMutation = useAdminReplyToTicket();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  const handleReply = async (ticketId: string) => {
    const reply = replyText[ticketId];
    if (!reply?.trim()) return;
    try {
      await replyMutation.mutateAsync({ ticketId, reply });
      setActionMsg({ id: ticketId, msg: 'Reply sent!', type: 'success' });
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
    } catch (err: any) {
      setActionMsg({ id: ticketId, msg: err?.message || 'Failed', type: 'error' });
    }
  };

  const statusColor = (status: string) => {
    if (status === 'open') return 'bg-red-100 text-red-700';
    if (status === 'replied') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Support Tickets</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : !tickets?.length ? (
        <div className="text-center py-8 text-muted-foreground">No support tickets</div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">User: {ticket.userId}</p>
                  </div>
                </div>
                {expandedTicket === ticket.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedTicket === ticket.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  <div className="bg-muted rounded-lg p-3 text-sm text-foreground">
                    {ticket.message}
                  </div>

                  {ticket.adminReply && (
                    <div className="bg-primary/10 rounded-lg p-3 text-sm">
                      <p className="text-xs font-medium text-primary mb-1">Admin Reply:</p>
                      <p className="text-foreground">{ticket.adminReply}</p>
                    </div>
                  )}

                  {actionMsg?.id === ticket.id && (
                    <div className={`p-2 rounded-lg text-sm flex items-center gap-2 ${actionMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {actionMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {actionMsg.msg}
                    </div>
                  )}

                  <div className="space-y-2">
                    <textarea
                      value={replyText[ticket.id] || ''}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                      placeholder="Type your reply..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <button
                      onClick={() => handleReply(ticket.id)}
                      disabled={!replyText[ticket.id]?.trim() || replyMutation.isPending}
                      className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {replyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

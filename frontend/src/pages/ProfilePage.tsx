import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useAuthStore } from '../store/authStore';
import { useChangePIN, useCreateSupportTicket, useGetUserTickets } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { formatDate } from '../utils/validation';
import {
  User, Settings, Shield, HelpCircle, LogOut, Phone, ChevronRight,
  CheckCircle, Clock, MessageSquare, Eye, EyeOff, Fingerprint, AlertCircle
} from 'lucide-react';

const FAQ_ITEMS = [
  { q: 'How do I send money?', a: 'Go to Home → Send Money, enter the recipient\'s mobile number and amount, then confirm with your PIN.' },
  { q: 'What is KYC and why is it required?', a: 'KYC (Know Your Customer) is a mandatory identity verification process required by Bangladesh Bank regulations before you can make any financial transactions.' },
  { q: 'How long does KYC approval take?', a: 'KYC approval typically takes 1-2 business days after submission.' },
  { q: 'What should I do if I forget my PIN?', a: 'Please contact our support team at +8809606945622 for PIN reset assistance.' },
  { q: 'Is my money safe with NuroPay?', a: 'Yes, NuroPay uses bank-grade encryption and is regulated by Bangladesh Bank. Your funds are fully insured.' },
  { q: 'How do I cash out?', a: 'Go to Home → Cash Out, select your preferred provider (bKash/Nagad/Rocket/Upay), enter the account number and amount.' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId, userName, userMobile, kycStatus, isLoggedIn, logout } = useAuthStore();
  const { actor } = useActor();

  // PIN Change
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Biometric
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('biometricEnabled') === 'true'
  );

  // Support Ticket
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketError, setTicketError] = useState('');

  const changePIN = useChangePIN();
  const createTicket = useCreateSupportTicket();
  const { data: tickets } = useGetUserTickets(userId);

  useEffect(() => {
    if (!isLoggedIn) navigate({ to: '/login' });
  }, [isLoggedIn, navigate]);

  const handleChangePIN = async () => {
    setPinError('');
    setPinSuccess('');
    if (!/^\d{4}$/.test(oldPin)) { setPinError('Old PIN must be 4 digits'); return; }
    if (!/^\d{4}$/.test(newPin)) { setPinError('New PIN must be 4 digits'); return; }
    if (newPin !== confirmPin) { setPinError('New PINs do not match'); return; }
    try {
      await changePIN.mutateAsync({ userId: userId!, oldPin, newPin });
      setPinSuccess('PIN changed successfully!');
      setOldPin(''); setNewPin(''); setConfirmPin('');
    } catch (err: any) {
      setPinError(err.message || 'Failed to change PIN');
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const cred = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: 'NuroPay' },
            user: { id: new Uint8Array(16), name: userMobile || 'user', displayName: userName || 'User' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
            timeout: 60000,
            authenticatorSelection: { userVerification: 'required' },
          }
        } as CredentialCreationOptions);
        if (cred) {
          localStorage.setItem('biometricEnabled', 'true');
          setBiometricEnabled(true);
        }
      } catch {
        setBiometricEnabled(false);
      }
    } else {
      localStorage.removeItem('biometricEnabled');
      setBiometricEnabled(false);
    }
  };

  const handleCreateTicket = async () => {
    setTicketError('');
    setTicketSuccess('');
    if (!ticketSubject.trim()) { setTicketError('Subject is required'); return; }
    if (!ticketMessage.trim()) { setTicketError('Message is required'); return; }
    try {
      await createTicket.mutateAsync({ userId: userId!, subject: ticketSubject, message: ticketMessage });
      setTicketSuccess('Ticket submitted successfully!');
      setTicketSubject(''); setTicketMessage('');
    } catch (err: any) {
      setTicketError(err.message || 'Failed to submit ticket');
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const kycBadge = {
    none: { label: 'Not Submitted', cls: 'bg-gray-100 text-gray-600' },
    pending: { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Verified', cls: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
  }[kycStatus];

  return (
    <Layout>
      <AppHeader title="My Info" showBack onBack={() => navigate({ to: '/home' })} />
      <div className="px-4 py-4 space-y-4">

        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl green-gradient flex items-center justify-center text-white font-display font-bold text-xl">
            {(userName || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-gray-900">{userName}</h2>
            <p className="text-sm text-gray-500">{userMobile}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${kycBadge.cls}`}>
              {kycBadge.label}
            </span>
          </div>
          <button onClick={() => navigate({ to: '/kyc' })} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
            <Settings size={16} className="text-primary-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Settings</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Change PIN */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">Change PIN</p>
              <div className="space-y-2.5">
                <div className="relative">
                  <Input
                    type={showOld ? 'text' : 'password'}
                    placeholder="Current PIN"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="rounded-xl h-10 pr-10 tracking-widest text-sm"
                  />
                  <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="New PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="rounded-xl h-10 pr-10 tracking-widest text-sm"
                  />
                  <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="Confirm New PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="rounded-xl h-10 tracking-widest text-sm"
                />
                {pinError && <p className="text-xs text-red-500">{pinError}</p>}
                {pinSuccess && <p className="text-xs text-green-600">{pinSuccess}</p>}
                <Button
                  onClick={handleChangePIN}
                  disabled={changePIN.isPending}
                  size="sm"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
                >
                  {changePIN.isPending ? 'Changing...' : 'Change PIN'}
                </Button>
              </div>
            </div>

            {/* Biometric */}
            <div className="flex items-center justify-between py-2 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Fingerprint size={18} className="text-primary-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Biometric Login</p>
                  <p className="text-xs text-gray-400">Use fingerprint or face ID</p>
                </div>
              </div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={handleBiometricToggle}
              />
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
            <Shield size={16} className="text-primary-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Privacy Policy</h3>
          </div>
          <div className="p-4 text-xs text-gray-600 space-y-2 leading-relaxed">
            <p><strong>Data Collection:</strong> NuroPay collects your mobile number, name, NID, address, and transaction data to provide banking services.</p>
            <p><strong>Data Security:</strong> All data is encrypted using AES-256 encryption and stored on secure servers compliant with Bangladesh Bank regulations.</p>
            <p><strong>Data Sharing:</strong> We do not sell your personal data. We may share data with regulatory authorities as required by law.</p>
            <p><strong>KYC Data:</strong> Your KYC information is used solely for identity verification and regulatory compliance.</p>
            <p><strong>Transaction Data:</strong> Transaction records are retained for 7 years as required by Bangladesh Bank guidelines.</p>
            <p><strong>Your Rights:</strong> You have the right to access, correct, or delete your personal data by contacting our support team.</p>
          </div>
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
            <HelpCircle size={16} className="text-primary-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Help & Support</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Support Number */}
            <a
              href="tel:+8809606945622"
              className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100"
            >
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                <Phone size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Call Support</p>
                <p className="font-semibold text-primary-600 text-sm">+8809606945622</p>
              </div>
            </a>

            {/* FAQ */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Frequently Asked Questions</p>
              <Accordion type="single" collapsible className="space-y-1">
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-gray-100 rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-3 py-2.5 text-xs font-medium text-gray-800 hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 text-xs text-gray-600">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Support Ticket Form */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Submit a Support Ticket</p>
              <div className="space-y-2">
                <Input
                  placeholder="Subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                />
                <Textarea
                  placeholder="Describe your issue..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="rounded-xl resize-none text-sm"
                  rows={3}
                />
                {ticketError && <p className="text-xs text-red-500">{ticketError}</p>}
                {ticketSuccess && <p className="text-xs text-green-600">{ticketSuccess}</p>}
                <Button
                  onClick={handleCreateTicket}
                  disabled={createTicket.isPending}
                  size="sm"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
                >
                  {createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </div>

            {/* Ticket History */}
            {tickets && tickets.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">My Tickets</p>
                <div className="space-y-2">
                  {[...tickets].sort((a, b) => Number(b.createdAt - a.createdAt)).map(ticket => (
                    <div key={ticket.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-800 truncate flex-1">{ticket.subject}</p>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                          ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                          ticket.status === 'replied' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{ticket.message}</p>
                      {ticket.adminReply && (
                        <div className="mt-2 p-2 bg-primary-50 rounded-lg border-l-2 border-primary-400">
                          <p className="text-[10px] font-semibold text-primary-600 mb-0.5">Admin Reply:</p>
                          <p className="text-xs text-gray-700">{ticket.adminReply}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-300 mt-1">{formatDate(ticket.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-2 font-semibold mb-4"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </Layout>
  );
}

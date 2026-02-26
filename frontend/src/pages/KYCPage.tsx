import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import PhotoUpload from '../components/PhotoUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../store/authStore';
import { useSubmitKYC } from '../hooks/useQueries';
import { CheckCircle, Clock, XCircle, AlertCircle, Shield } from 'lucide-react';

export default function KYCPage() {
  const navigate = useNavigate();
  const { userId, kycStatus, isLoggedIn, setKycStatus } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [nid, setNid] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submitKYC = useSubmitKYC();

  useEffect(() => {
    if (!isLoggedIn) navigate({ to: '/login' });
  }, [isLoggedIn, navigate]);

  const handleSubmit = async () => {
    setError('');
    if (!fullName.trim()) { setError('Full name is required'); return; }
    if (!/^\d{10,17}$/.test(nid)) { setError('NID must be 10-17 digits'); return; }
    if (!address.trim()) { setError('Address is required'); return; }
    if (!photoUrl) { setError('Photo is required'); return; }

    try {
      await submitKYC.mutateAsync({ userId: userId!, nid, fullName, address, photoUrl });
      setKycStatus('pending');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'KYC submission failed');
    }
  };

  const canSubmit = kycStatus === 'none' || kycStatus === 'rejected';

  return (
    <Layout>
      <AppHeader title="KYC Verification" showBack />
      <div className="px-4 py-5 space-y-5">
        {/* Status Banner */}
        {kycStatus === 'approved' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
            <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">KYC Approved</p>
              <p className="text-xs text-green-600">Your identity has been verified. You can now make transactions.</p>
            </div>
          </div>
        )}
        {kycStatus === 'pending' && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
            <Clock size={24} className="text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Under Review</p>
              <p className="text-xs text-yellow-600">Your KYC is being reviewed. This usually takes 1-2 business days.</p>
            </div>
          </div>
        )}
        {kycStatus === 'rejected' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
            <XCircle size={24} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">KYC Rejected</p>
              <p className="text-xs text-red-600">Your KYC was rejected. Please resubmit with correct information.</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
            <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Submitted Successfully!</p>
              <p className="text-xs text-green-600">Your KYC is now under review.</p>
            </div>
          </div>
        )}

        {canSubmit && !success && (
          <>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <Shield size={16} className="text-blue-600" />
              <p className="text-xs text-blue-700">All information is encrypted and securely stored.</p>
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-2xl p-4 card-shadow">
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">Photo / Selfie *</Label>
              <PhotoUpload onPhotoUrl={setPhotoUrl} currentUrl={photoUrl} />
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-2xl p-4 card-shadow space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name *</Label>
                <Input
                  placeholder="As per NID card"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">NID Number *</Label>
                <Input
                  type="tel"
                  placeholder="10-17 digit NID number"
                  value={nid}
                  onChange={(e) => setNid(e.target.value.replace(/\D/g, ''))}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Address *</Label>
                <Textarea
                  placeholder="Your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitKYC.isPending}
              className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold"
            >
              {submitKYC.isPending ? 'Submitting...' : 'Submit KYC'}
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}

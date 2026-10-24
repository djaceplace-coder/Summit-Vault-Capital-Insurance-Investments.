import { motion } from 'motion/react';
import { X, FileText, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { PolicyRecord } from '../../pages/dashboard/InsurancePolicies';

export function ClaimModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'policies'),
      (snap) => {
        const list: PolicyRecord[] = [];
        snap.forEach((d) => list.push(d.data() as PolicyRecord));
        setPolicies(list);
        if (list.length > 0 && !selectedPolicy) {
          setSelectedPolicy(`${list[0].type} (${list[0].policyNumber})`);
        }
      },
      () => {}
    );
    return () => unsub();
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmitClaim = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const msgId = `msg_${Date.now()}`;
      const claimSummary = `[INSURANCE CLAIM FILED] Policy: ${selectedPolicy || 'General Protection'} · Incident Date: ${incidentDate} · Details: ${description || 'Submitted via Vault Claims Portal'}${uploadedFileName ? ` · Attachment: ${uploadedFileName}` : ''}`;

      await setDoc(doc(db, 'chats', user.uid, 'messages', msgId), {
        id: msgId,
        userId: user.uid,
        senderRole: 'client',
        senderName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user.email || 'Client',
        agentId: profile?.assignedAgentId || 'AG-003',
        agentName: profile?.assignedAgentName || 'Elena Rodriguez',
        agentRole: 'Claims & Underwriting Specialist',
        text: claimSummary,
        createdAt: now,
      });

      await setDoc(
        doc(db, 'chats', user.uid),
        {
          userId: user.uid,
          userEmail: profile?.email || user.email || '',
          userName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user.email || 'Client',
          selectedAgentId: profile?.assignedAgentId || 'AG-003',
          selectedAgentName: profile?.assignedAgentName || 'Elena Rodriguez',
          selectedAgentRole: 'Claims & Underwriting Specialist',
          lastMessage: claimSummary,
          lastMessageAt: now,
          unreadByAdmin: 1,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (e) {
      console.error('Error submitting claim:', e);
    } finally {
      setSubmitting(false);
      setStep(1);
      setDescription('');
      setUploadedFileName(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">File an Insurance Claim</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1
                ? 'Step 1 of 3 · Incident Details'
                : step === 2
                ? 'Step 2 of 3 · Supporting Documentation'
                : 'Step 3 of 3 · Review & Dispatch'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Select Policy
              </label>
              <select
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              >
                {policies.length === 0 ? (
                  <option value="General Vault Coverage Inquiry">General Vault Coverage Inquiry</option>
                ) : (
                  policies.map((p) => (
                    <option key={p.id} value={`${p.type} (${p.policyNumber})`}>
                      {p.type} — #{p.policyNumber} (${p.coverage.toLocaleString()})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Date of Incident
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Description of Incident
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a clear summary of the claim circumstances..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none text-sm"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Next: Supporting Documentation
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer block">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedFileName(file.name);
                }}
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-900 mb-1">
                Click to attach documentation (optional)
              </div>
              <div className="text-xs text-slate-500">PDF, JPG, or PNG up to 10MB (Receipts, Reports, Appraisals)</div>
            </label>

            {uploadedFileName && (
              <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-900">{uploadedFileName}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFileName(null)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Review Claim
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Policy:</span>
                <span className="font-semibold text-slate-900">{selectedPolicy || 'General Protection'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Incident Date:</span>
                <span className="font-semibold text-slate-900">{incidentDate}</span>
              </div>
              {uploadedFileName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Attachment:</span>
                  <span className="font-semibold text-slate-900">{uploadedFileName}</span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold block mb-0.5">Declaration of Truth</span>
                Submitting this claim dispatches your dossier directly to our Fiduciary Underwriting Desk and opens a priority thread in your Messages portal.
              </div>
            </div>

            <button
              onClick={handleSubmitClaim}
              disabled={submitting}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Submitting Claim...' : 'Submit Claim to Underwriting'}
            </button>

            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Back to Documentation
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, FileText, AlertCircle, Phone, ArrowRight, Download, Plus, X, CheckCircle2, Trash2
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { ClaimModal } from '../../components/dashboard/ClaimModal';

export interface PolicyRecord {
  id: string;
  userId: string;
  policyNumber: string;
  type: string;
  coverage: number;
  premium: number;
  status: 'active' | 'pending' | 'lapsed';
  createdAt?: string;
}

const AVAILABLE_PLANS = [
  {
    type: 'Term Life Insurance (20-Year)',
    coverage: 1000000,
    premium: 65,
    desc: 'Income replacement and estate liquidity protection with level monthly premiums.',
  },
  {
    type: 'Private Placement Whole Life (PPLI)',
    coverage: 2500000,
    premium: 420,
    desc: 'Tax-advantaged permanent life coverage with institutional cash value accumulation.',
  },
  {
    type: 'Executive Global Health & Medical',
    coverage: 500000,
    premium: 185,
    desc: 'Worldwide private hospital, specialist, and air-evacuation coverage.',
  },
  {
    type: 'High-Value Property & Vault Casualty',
    coverage: 1500000,
    premium: 140,
    desc: 'Comprehensive protection for residences, fine art, bullion, and sovereign custody.',
  },
];

export function InsurancePolicies() {
  const { user, profile } = useAuth();
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();

  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [customCoverage, setCustomCoverage] = useState('1000000');
  const [binding, setBinding] = useState(false);

  useEffect(() => {
    if (!user) {
      setPolicies([]);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'policies'),
      (snap) => {
        const list: PolicyRecord[] = [];
        snap.forEach((d) => {
          list.push(d.data() as PolicyRecord);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setPolicies(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Error loading policies:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleBindPolicy = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBinding(true);

    try {
      const chosen = AVAILABLE_PLANS[selectedPlanIdx];
      const covAmount = Number(customCoverage) > 0 ? Number(customCoverage) : chosen.coverage;
      const estPremium = Math.max(25, Math.round((covAmount / chosen.coverage) * chosen.premium));
      const id = `pol_${Date.now()}`;
      const policyNumber = `POL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newPolicy: PolicyRecord = {
        id,
        userId: user.uid,
        policyNumber,
        type: chosen.type,
        coverage: covAmount,
        premium: estPremium,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid, 'policies', id), newPolicy);
      setShowEnrollModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/policies`);
    } finally {
      setBinding(false);
    }
  };

  const handleCancelPolicy = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'policies', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/policies/${id}`);
    }
  };

  const handleDownloadCertificate = (policy: PolicyRecord) => {
    const content = [
      'SUMMIT VAULT CAPITAL — CERTIFICATE OF INSURANCE COVERAGE',
      '==========================================================',
      `Policyholder: ${profile?.firstName || 'Client'} ${profile?.lastName || ''}`.trim(),
      `Email: ${profile?.email || user?.email || ''}`,
      `Policy Number: ${policy.policyNumber}`,
      `Coverage Line: ${policy.type}`,
      `Coverage Limit: $${policy.coverage.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `Monthly Premium: $${policy.premium.toLocaleString('en-US', { minimumFractionDigits: 2 })} / month`,
      `Status: ${policy.status.toUpperCase()}`,
      `Issued Date: ${policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`,
      '==========================================================',
      'Underwritten & Managed by Summit Vault Capital Fiduciary Desk',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${policy.policyNumber}-Certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1">Insurance Policies</h1>
          <p className="text-slate-500 text-sm">Manage your active underwriting policies, coverage limits, and claims.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/insurance/quote"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-xs transition-colors"
          >
             coverage Calculator
          </Link>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Bind New Policy
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
              Loading policy ledger...
            </div>
          ) : policies.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-2xs">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-1">No Active Insurance Policies ($0.00 Coverage)</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                Protect your estate, family, and sovereign vault assets by binding an institutional life, health, or property policy.
              </p>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Bind First Coverage Policy
              </button>
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{policy.type}</h3>
                      <div className="text-xs text-slate-500 font-mono">Policy #{policy.policyNumber}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {policy.status}
                  </span>
                </div>

                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6 bg-slate-50/60">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Coverage Limit</div>
                    <div className="font-bold text-slate-900 font-mono tabular-nums">
                      ${policy.coverage.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Monthly Premium</div>
                    <div className="font-bold text-slate-900 font-mono tabular-nums">
                      ${policy.premium.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Policyholder</div>
                    <div className="font-semibold text-slate-900 truncate text-sm">
                      {profile?.firstName || 'Primary'} {profile?.lastName || 'Insured'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                  <button
                    onClick={() => handleCancelPolicy(policy.id)}
                    className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Policy
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadCertificate(policy)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Certificate
                    </button>
                    <button
                      onClick={() =>
                        openAgentChat(
                          `I would like to review or update my ${policy.type} (${policy.policyNumber}).`
                        )
                      }
                      className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Manage with Advisor <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-3">Support & Claims</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Need to file a claim or update your policy beneficiaries? Our fiduciary underwriting desk responds in real time.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => setShowClaimModal(true)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                    <FileText className="w-4 h-4" />
                  </div>
                  File an Insurance Claim
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                onClick={() => openAgentChat('I would like to update my policy beneficiary designation.')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  Update Beneficiary
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <div className="pt-4 mt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 p-2 text-slate-700 text-xs font-semibold">
                  <Phone className="w-4 h-4 text-slate-400" />
                  24/7 Claims Desk: 1-800-555-0199
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bind New Policy Modal */}
      <AnimatePresence>
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEnrollModal(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-bold font-heading text-slate-900">Bind Coverage Policy</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Instant underwriting & policy issuance</p>
                </div>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBindPolicy} className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Select Coverage Line
                  </label>
                  <div className="space-y-2.5">
                    {AVAILABLE_PLANS.map((plan, idx) => {
                      const active = selectedPlanIdx === idx;
                      return (
                        <button
                          key={plan.type}
                          type="button"
                          onClick={() => {
                            setSelectedPlanIdx(idx);
                            setCustomCoverage(String(plan.coverage));
                          }}
                          className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                            active
                              ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900 text-sm">{plan.type}</span>
                            <span className="text-xs font-bold text-amber-700 font-mono tabular-nums">
                              ${plan.premium}/mo
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{plan.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Coverage Limit (USD)
                  </label>
                  <input
                    type="number"
                    min="50000"
                    step="50000"
                    value={customCoverage}
                    onChange={(e) => setCustomCoverage(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={binding}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {binding ? 'Issuing Policy...' : 'Bind & Activate Policy'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showClaimModal && <ClaimModal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

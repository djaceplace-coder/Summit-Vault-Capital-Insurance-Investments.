import { motion } from 'motion/react';
import { ShieldCheck, FileText, AlertCircle, Phone, ArrowRight, Download } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const policies = [
  {
    id: 'POL-2024-8932',
    type: 'Term Life Insurance',
    status: 'active',
    coverage: '$1,000,000',
    premium: '$45.00 / month',
    nextPayment: 'Aug 15, 2026',
    beneficiary: 'Jane Doe (Spouse)',
  },
  {
    id: 'POL-2023-1455',
    type: 'Whole Life Insurance',
    status: 'active',
    coverage: '$500,000',
    premium: '$210.00 / month',
    nextPayment: 'Aug 01, 2026',
    beneficiary: 'Jane Doe (Spouse)',
    cashValue: '$12,450.00',
  }
];

export function InsurancePolicies() {
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-2">Insurance Policies</h1>
          <p className="text-slate-500">Manage your active policies and coverage details.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/insurance/quote" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-sm flex items-center gap-2 transition-colors">
            <ShieldCheck className="w-4 h-4" /> Get New Quote
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{policy.type}</h3>
                    <div className="text-sm text-slate-500">Policy #{policy.id}</div>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {policy.status}
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Coverage Amount</div>
                  <div className="font-bold text-slate-900">{policy.coverage}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Premium</div>
                  <div className="font-bold text-slate-900">{policy.premium}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Next Payment</div>
                  <div className="font-medium text-slate-900">{policy.nextPayment}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Beneficiary</div>
                  <div className="font-medium text-slate-900 truncate">{policy.beneficiary}</div>
                </div>
              </div>

              {policy.cashValue && (
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-700">Accumulated Cash Value:</span>
                    <span className="font-bold text-green-600">{policy.cashValue}</span>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-white border-t border-slate-100 flex gap-2 justify-end">
                <button 
                  onClick={() => openAgentChat('I would like to download my insurance policy documents.')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Policy
                </button>
                <button 
                  onClick={() => openAgentChat('I need help managing my insurance policy.')}
                  className="px-4 py-2 text-sm font-medium text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  Manage Policy <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">Support & Claims</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Need to file a claim or update your policy details? Our dedicated support team is available 24/7.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => openAgentChat('I need to file an insurance claim.')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-slate-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-900">
                     <FileText className="w-4 h-4" />
                  </div>
                  File a Claim
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
              
              <button 
                onClick={() => openAgentChat('I would like to update my policy beneficiary.')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-slate-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-900">
                     <AlertCircle className="w-4 h-4" />
                  </div>
                  Update Beneficiary
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <div className="pt-4 mt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 text-slate-700 text-sm font-medium">
                  <Phone className="w-5 h-5 text-slate-400" />
                  1-800-555-0199
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

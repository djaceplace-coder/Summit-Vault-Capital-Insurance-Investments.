import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { motion } from 'motion/react';
import { DollarSign, Search, Edit2, Save, X, Activity, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type UserBalance = {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  totalBalance: number;
  investedAmount: number;
  cashBalance: number;
  returnsAmount: number;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function AdminBalances() {
  const { user, isAdmin } = useAuth();
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserBalance>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    fetchBalances();
  }, [user]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetched: UserBalance[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          userId: data.userId || docSnap.id,
          email: data.email || 'Unknown',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          totalBalance: Number(data.totalBalance ?? 0),
          investedAmount: Number(data.investedAmount ?? 0),
          cashBalance: Number(data.cashBalance ?? 0),
          returnsAmount: Number(data.returnsAmount ?? 0),
          role: data.role || 'client',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setBalances(fetched);
    } catch (error) {
      console.warn('Error fetching Firestore users:', error);
      // Fallback empty or default
      setBalances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (balance: UserBalance) => {
    setEditingId(balance.id);
    setEditForm({
      totalBalance: balance.totalBalance,
      investedAmount: balance.investedAmount,
      cashBalance: balance.cashBalance,
      returnsAmount: balance.returnsAmount,
    });
  };

  const handleSave = async (id: string) => {
    try {
      const userRef = doc(db, 'users', id);
      const updates = {
        totalBalance: Number(editForm.totalBalance ?? 0),
        investedAmount: Number(editForm.investedAmount ?? 0),
        cashBalance: Number(editForm.cashBalance ?? 0),
        returnsAmount: Number(editForm.returnsAmount ?? 0),
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updates);
      
      setBalances(balances.map(b => b.id === id ? { ...b, ...updates } : b));
      setEditingId(null);
      setSaveSuccess('Balance successfully updated in Firebase');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }
  };

  const filteredBalances = balances.filter(b => 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Firebase Firestore Admin
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-white">Client Balances & Accounts</h1>
            <p className="text-slate-400 text-sm mt-1">Realtime synchronized ledger powered by Google Cloud Firestore</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-slate-700 w-full sm:w-64 text-sm"
            />
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {saveSuccess}
          </div>
        )}

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-xs uppercase font-medium text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Total Balance</th>
                  <th className="px-6 py-4">Invested</th>
                  <th className="px-6 py-4">Cash</th>
                  <th className="px-6 py-4">Returns</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Syncing Firestore client documents...
                    </td>
                  </tr>
                ) : filteredBalances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No client accounts registered in Firestore yet.
                    </td>
                  </tr>
                ) : (
                  filteredBalances.map((balance) => (
                    <tr key={balance.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white flex items-center gap-2">
                          {balance.firstName || balance.lastName ? `${balance.firstName} ${balance.lastName}`.trim() : 'Client'}
                          {balance.role === 'admin' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase font-semibold">Admin</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{balance.email}</div>
                      </td>
                      {editingId === balance.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              value={editForm.totalBalance ?? 0}
                              onChange={(e) => setEditForm({...editForm, totalBalance: parseFloat(e.target.value) || 0})}
                              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              value={editForm.investedAmount ?? 0}
                              onChange={(e) => setEditForm({...editForm, investedAmount: parseFloat(e.target.value) || 0})}
                              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              value={editForm.cashBalance ?? 0}
                              onChange={(e) => setEditForm({...editForm, cashBalance: parseFloat(e.target.value) || 0})}
                              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              value={editForm.returnsAmount ?? 0}
                              onChange={(e) => setEditForm({...editForm, returnsAmount: parseFloat(e.target.value) || 0})}
                              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleSave(balance.id)} className="text-emerald-400 hover:text-emerald-300 mr-3 cursor-pointer">
                              <Save className="w-4 h-4 inline" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                              <X className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-medium text-white">
                            ${(balance.totalBalance ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            ${(balance.investedAmount ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            ${(balance.cashBalance ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-emerald-400">
                            +${(balance.returnsAmount ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleEditClick(balance)} className="text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1 ml-auto">
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

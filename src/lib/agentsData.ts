import { useEffect, useState } from 'react';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface AgentRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: string;
  location: string;
  lang: string;
  img: string;
  status: 'Active' | 'Pending' | 'Suspended';
  aum: string;
  clients: number;
  bio: string;
}

export const DEFAULT_AGENTS: AgentRecord[] = [
  {
    id: 'AG-001',
    name: 'Sarah Jenkins',
    email: 's.jenkins@summitvaultcapital.online',
    role: 'Equities & Wealth Specialist',
    exp: '12 yrs exp',
    location: 'Las Vegas, NV',
    lang: 'English',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    aum: '$45.2M',
    clients: 0,
    bio: 'Sarah brings over a decade of experience in traditional equities and holistic wealth planning. She specializes in creating tax-efficient portfolios for high-net-worth individuals and families.'
  },
  {
    id: 'AG-002',
    name: 'David Chen',
    email: 'd.chen@summitvaultcapital.online',
    role: 'Digital Assets Lead',
    exp: '8 yrs exp',
    location: 'Reno, NV',
    lang: 'English, Mandarin',
    img: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    aum: '$32.1M',
    clients: 0,
    bio: 'David leads institutional digital asset custody and cold-storage allocation strategies, bridging sovereign-grade blockchain custody with traditional portfolio management.'
  },
  {
    id: 'AG-003',
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@summitvaultcapital.online',
    role: 'Insurance & Estate Planning',
    exp: '15 yrs exp',
    location: 'Miami, FL',
    lang: 'English, Spanish',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    aum: '$68.5M',
    clients: 0,
    bio: 'Elena structures private placement life insurance (PPLI), executive key-person policies, and cross-border generational estate trusts.'
  },
  {
    id: 'AG-004',
    name: 'Marcus Johnson',
    email: 'm.johnson@summitvaultcapital.online',
    role: 'Alternative Assets',
    exp: '10 yrs exp',
    location: 'New York, NY',
    lang: 'English',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    aum: '$28.4M',
    clients: 0,
    bio: 'Marcus oversees sovereign bullion, numismatic reserves, and private credit allocations designed for non-correlated capital preservation.'
  },
  {
    id: 'AG-005',
    name: 'Priya Patel',
    email: 'p.patel@summitvaultcapital.online',
    role: 'Managed Portfolios',
    exp: '7 yrs exp',
    location: 'Chicago, IL',
    lang: 'English, Hindi',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    aum: '$19.8M',
    clients: 0,
    bio: 'Priya specializes in quantitative rebalancing, risk-parity portfolios, and automated tax-loss harvesting across multi-currency vaults.'
  },
  {
    id: 'AG-006',
    name: 'Michael Chang',
    email: 'm.chang@summitvaultcapital.online',
    role: 'Property & Casualty',
    exp: '20 yrs exp',
    location: 'San Francisco, CA',
    lang: 'English',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    aum: '$54.0M',
    clients: 0,
    bio: 'Michael heads high-value property, aviation, marine, and fine art casualty underwriting for private family offices.'
  }
];

export function useAgents() {
  const [agents, setAgents] = useState<AgentRecord[]>(DEFAULT_AGENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'agents'),
      async (snap) => {
        if (snap.empty) {
          // Seed default agents into Firestore so Admin can edit/manage them in real time
          try {
            for (const ag of DEFAULT_AGENTS) {
              await setDoc(doc(db, 'agents', ag.id), ag);
            }
          } catch (e) {
            console.warn('Could not seed default agents:', e);
          }
          setAgents(DEFAULT_AGENTS);
        } else {
          const list: AgentRecord[] = [];
          snap.forEach((d) => {
            list.push(d.data() as AgentRecord);
          });
          list.sort((a, b) => a.id.localeCompare(b.id));
          setAgents(list);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Agents listener fallback:', err);
        setAgents(DEFAULT_AGENTS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { agents, loading };
}

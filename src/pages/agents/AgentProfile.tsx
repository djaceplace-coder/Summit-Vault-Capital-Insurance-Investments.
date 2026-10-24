import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Globe, Star, Calendar, MessageSquare, ShieldCheck, Award } from 'lucide-react';

export function AgentProfile() {
  const { id } = useParams<{ id: string }>();

  // Mock data fetching based on ID
  const agent = {
    id: id,
    name: "Sarah Jenkins",
    role: "Equities & Wealth Specialist",
    exp: "12 yrs exp",
    location: "Las Vegas, NV",
    lang: "English",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    bio: "Sarah brings over a decade of experience in traditional equities and holistic wealth planning. She specializes in creating tax-efficient portfolios for high-net-worth individuals and families, ensuring their investments align perfectly with their long-term estate goals.",
    licenses: ["FINRA Series 7", "FINRA Series 66", "NV Life & Health"],
    rating: 4.9,
    reviews: 124
  };

  return (
    <div className="flex flex-col w-full overflow-hidden bg-slate-50 min-h-screen">
      
      <div className="max-w-7xl mx-auto w-full px-5 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Col - Photo & Quick Actions */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl overflow-hidden aspect-square sm:aspect-[4/5] shadow-lg relative"
            >
              <img src={agent.img} alt={agent.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{agent.rating}</span>
                  <span className="text-white/80 text-sm">({agent.reviews} reviews)</span>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <Link to="/login" className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" /> Book a Consultation
              </Link>
              <Link to="/login" className="w-full bg-slate-50 text-slate-900 border border-slate-200 px-6 py-4 rounded-xl font-medium hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" /> Send a Message
              </Link>
            </div>
          </div>
          
          {/* Right Col - Details */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{agent.role}</span>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{agent.exp}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-6">{agent.name}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>{agent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span>{agent.lang}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4">About Sarah</h3>
              <p className="text-slate-600 leading-relaxed mb-10">
                {agent.bio}
              </p>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-900" /> Credentials & Licenses
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {agent.licenses.map((lic, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Award className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{lic}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Reviews Stub */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Client Reviews</h3>
              <div className="space-y-6">
                {[1, 2].map((_, i) => (
                  <div key={i} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">"Incredible guidance and patience"</h4>
                    <p className="text-slate-600 text-sm mb-2">Sarah helped me consolidate my messy portfolio and set up a solid whole life policy for my kids. She explained everything clearly without the jargon.</p>
                    <span className="text-slate-400 text-xs">— Verified Client, 2 weeks ago</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

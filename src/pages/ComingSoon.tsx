import { motion } from 'motion/react';
import { Construction } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6"
      >
        <Construction className="w-10 h-10 text-slate-400" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold font-heading text-slate-900 mb-4"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-500 max-w-md mx-auto"
      >
        This module is currently under development as we continuously expand our platform capabilities. Check back soon.
      </motion.p>
    </div>
  );
}

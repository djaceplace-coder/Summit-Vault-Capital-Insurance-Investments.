import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!loading && user && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAFA] text-slate-800">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

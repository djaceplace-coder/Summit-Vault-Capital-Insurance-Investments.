/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from './lib/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { ClientLayout } from './components/layout/ClientLayout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { StocksEquities } from './pages/products/StocksEquities';
import { DigitalAssets } from './pages/products/DigitalAssets';
import { InsuranceLinked } from './pages/products/InsuranceLinked';
import { CoinsAlternative } from './pages/products/CoinsAlternative';
import { ManagedPortfolios } from './pages/products/ManagedPortfolios';
import { CompareQuiz } from './pages/products/CompareQuiz';
import { Insurance } from './pages/Insurance';
import { LineOfBusiness } from './pages/insurance/LineOfBusiness';
import { QuoteFlow } from './pages/insurance/QuoteFlow';
import { AgentsDirectory } from './pages/agents/AgentsDirectory';
import { AgentProfile } from './pages/agents/AgentProfile';
import { BecomeAgent } from './pages/agents/BecomeAgent';
import { AgentPortal } from './pages/agents/AgentPortal';
import { AgentLogin } from './pages/agents/AgentLogin';
import { LearnHub } from './pages/learn/LearnHub';
import { Article } from './pages/learn/Article';
import { Glossary } from './pages/learn/Glossary';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { AssetsExplorer } from './pages/AssetsExplorer';
import { ForBusiness } from './pages/ForBusiness';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAgents } from './pages/admin/AdminAgents';
import { AdminBalances } from './pages/admin/AdminBalances';
import { ComingSoon } from './pages/ComingSoon';
import { Portfolio } from './pages/dashboard/Portfolio';
import { Transactions } from './pages/dashboard/Transactions';
import { Messages } from './pages/dashboard/Messages';
import { Settings } from './pages/dashboard/Settings';
import { InsurancePolicies } from './pages/dashboard/InsurancePolicies';

import { ScrollToTop } from './components/common/ScrollToTop';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          
          <Route path="products">
            <Route index element={<Products />} />
            <Route path="stocks" element={<StocksEquities />} />
            <Route path="digital-assets" element={<DigitalAssets />} />
            <Route path="insurance-linked" element={<InsuranceLinked />} />
            <Route path="coins" element={<CoinsAlternative />} />
            <Route path="managed" element={<ManagedPortfolios />} />
            <Route path="compare" element={<CompareQuiz />} />
          </Route>

          <Route path="insurance">
            <Route index element={<Insurance />} />
            <Route path="quote" element={<QuoteFlow />} />
            <Route path=":type" element={<LineOfBusiness />} />
          </Route>

          <Route path="agents">
            <Route index element={<AgentsDirectory />} />
            <Route path="apply" element={<BecomeAgent />} />
            <Route path="login" element={<AgentLogin />} />
            <Route path="portal" element={<AgentPortal />} />
            <Route path=":id" element={<AgentProfile />} />
          </Route>

          <Route path="learn">
            <Route index element={<LearnHub />} />
            <Route path="article/:id" element={<Article />} />
            <Route path="glossary" element={<Glossary />} />
          </Route>

          <Route path="about" element={<About />} />
          <Route path="for-business" element={<ForBusiness />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        <Route element={<ClientLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/insurance" element={<InsurancePolicies />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="admin">
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="balances" element={<AdminBalances />} />
        </Route>

        {/* 404 Catch-All Route for Clean Reloads */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

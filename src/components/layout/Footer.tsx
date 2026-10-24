import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import { Logo } from '../ui/Logo';

export function Footer() {
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Agents', href: '/agents' },
        { name: 'Careers / Become an Agent', href: '/agents/apply' },
        { name: 'Press & Media', href: '/about#press' },
        { name: 'For Business / Partners', href: '/for-business' },
        { name: 'Contact Us', href: '/support/contact' },
      ],
    },
    {
      title: 'Products',
      links: [
        { name: 'Stocks & Equities', href: '/products/stocks' },
        { name: 'Digital Assets & Crypto', href: '/products/digital-assets' },
        { name: 'Coins & Alternative Assets', href: '/products/coins' },
        { name: 'Insurance-Linked Products', href: '/products/insurance-linked' },
        { name: 'Managed Portfolios', href: '/products/managed' },
        { name: 'Compare Products', href: '/products/compare' },
      ],
    },
    {
      title: 'Insurance',
      links: [
        { name: 'Life Insurance', href: '/insurance/life' },
        { name: 'Health Insurance', href: '/insurance/health' },
        { name: 'Property Insurance', href: '/insurance/property' },
        { name: 'Get a Quote', href: '/insurance/quote' },
        { name: 'File a Claim', href: '/app/policies/claim' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Learn / Insights', href: '/learn' },
        { name: 'Glossary', href: '/learn/glossary' },
        { name: 'Help Center', href: '/support' },
        { name: 'FAQ', href: '/support#faq' },
        { name: 'Webinars & Events', href: '/learn/events' },
      ],
    },
    {
      title: 'Legal & Compliance',
      links: [
        { name: 'Terms of Service', href: '/legal/terms' },
        { name: 'Privacy Policy', href: '/legal/privacy' },
        { name: 'Disclosures & Risk Statements', href: '/legal/disclosures' },
        { name: 'State-by-State Licensing', href: '/legal/licensing' },
        { name: 'Cookie Policy', href: '/legal/cookies' },
        { name: 'Accessibility Statement', href: '/legal/accessibility' },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 lg:py-24 rounded-t-[40px] sm:rounded-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center group mb-12">
            <Logo dark={true} />
          </Link>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8">
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h4 className="text-white font-bold tracking-wide mb-6">{column.title}</h4>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-white" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-white" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-white" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            NV License #1029384 | Additional state licenses available on request
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500 leading-relaxed max-w-5xl">
          <p className="mb-4">
            Summit Vault Capital is a licensed insurance agency and brokerage operating in the State of Nevada and additional licensed jurisdictions. Investment products are not FDIC insured, are not bank guaranteed, and may lose value. Insurance products are subject to underwriting approval; terms, conditions, and exclusions apply. Past performance is not indicative of future results.
          </p>
          <p>
            Summit Vault Capital acts as a licensed intermediary; specific product providers and underwriters are disclosed at point of sale. Securities, where applicable, offered through Partner Broker-Dealer LLC, Member FINRA/SIPC. © {new Date().getFullYear()} Summit Vault Capital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

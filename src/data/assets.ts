export type AssetClass = 'Equities' | 'Crypto' | 'Fixed Income' | 'Commodities' | 'Real Estate';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change24h: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  description: string;
  roiAlgorithm: string;
}

export const ASSETS: Asset[] = [
  // Equities
  { id: 'a1', symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equities', price: 175.50, change24h: 1.2, riskLevel: 'Medium', description: 'Technology giant with strong cash flows and brand loyalty.', roiAlgorithm: 'Based on quarterly earnings reports, product launch cycles, and global macroeconomic tech trends. Historically averages 15-20% annualized.' },
  { id: 'a2', symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'Equities', price: 390.20, change24h: 0.8, riskLevel: 'Medium', description: 'Enterprise software and cloud computing leader.', roiAlgorithm: 'Driven by Azure growth, AI integrations, and enterprise software renewals. Stable compounding historically.' },
  { id: 'a3', symbol: 'TSLA', name: 'Tesla Inc.', assetClass: 'Equities', price: 180.30, change24h: -2.1, riskLevel: 'High', description: 'Electric vehicles, energy storage, and AI robotics.', roiAlgorithm: 'Highly volatile, driven by delivery numbers, regulatory changes, and CEO announcements. High potential variance.' },
  { id: 'a4', symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'Equities', price: 880.10, change24h: 3.5, riskLevel: 'High', description: 'Leading designer of AI and graphics processing units.', roiAlgorithm: 'Hyper-growth tied to global AI infrastructure spending. Extremely sensitive to semiconductor supply chains.' },
  { id: 'a5', symbol: 'JPM', name: 'JPMorgan Chase & Co.', assetClass: 'Equities', price: 195.40, change24h: 0.5, riskLevel: 'Low', description: 'Global leader in financial services and investment banking.', roiAlgorithm: 'Steady dividend yield + capital appreciation linked to interest rates and global economic health.' },
  { id: 'a6', symbol: 'V', name: 'Visa Inc.', assetClass: 'Equities', price: 275.90, change24h: 0.2, riskLevel: 'Low', description: 'Global payments technology company.', roiAlgorithm: 'Scales with global consumer spending and inflation. Very high profit margins.' },
  { id: 'a7', symbol: 'JNJ', name: 'Johnson & Johnson', assetClass: 'Equities', price: 155.20, change24h: -0.3, riskLevel: 'Low', description: 'Pharmaceutical and medical devices powerhouse.', roiAlgorithm: 'Defensive stock. Returns are stable regardless of economic cycles due to healthcare necessity.' },
  { id: 'a8', symbol: 'AMZN', name: 'Amazon.com Inc.', assetClass: 'Equities', price: 185.00, change24h: 1.5, riskLevel: 'Medium', description: 'E-commerce and cloud computing dominant player.', roiAlgorithm: 'Driven by AWS profitability and retail margin improvements.' },
  { id: 'a9', symbol: 'GOOGL', name: 'Alphabet Inc.', assetClass: 'Equities', price: 170.80, change24h: 0.9, riskLevel: 'Medium', description: 'Search, advertising, and AI technology conglomerate.', roiAlgorithm: 'Ad-spend cyclicality balanced by cloud growth and AI advancements.' },
  { id: 'a10', symbol: 'META', name: 'Meta Platforms Inc.', assetClass: 'Equities', price: 490.50, change24h: 2.3, riskLevel: 'High', description: 'Social media, VR, and AI development.', roiAlgorithm: 'Highly sensitive to digital advertising markets and AR/VR capital expenditures.' },
  { id: 'a11', symbol: 'WMT', name: 'Walmart Inc.', assetClass: 'Equities', price: 60.10, change24h: 0.1, riskLevel: 'Low', description: 'Largest retail corporation in the world.', roiAlgorithm: 'Extremely defensive. Outperforms during recessions due to consumer cost-cutting.' },
  { id: 'a12', symbol: 'UNH', name: 'UnitedHealth Group', assetClass: 'Equities', price: 480.20, change24h: -0.5, riskLevel: 'Low', description: 'Managed healthcare and insurance.', roiAlgorithm: 'Regulated growth tied to healthcare premiums and demographics.' },

  // Crypto
  { id: 'c1', symbol: 'BTC', name: 'Bitcoin', assetClass: 'Crypto', price: 65000.00, change24h: 4.2, riskLevel: 'Very High', description: 'Decentralized digital currency and store of value.', roiAlgorithm: 'Modeled on scarcity (halving cycles), institutional adoption, and macro liquidity (fiat debasement). Expect extreme volatility.' },
  { id: 'c2', symbol: 'ETH', name: 'Ethereum', assetClass: 'Crypto', price: 3400.00, change24h: 5.1, riskLevel: 'Very High', description: 'Smart contract platform powering Web3.', roiAlgorithm: 'Value accrues from network usage fees (gas) and staked yield mechanisms. Correlated to DeFi and NFT activity.' },
  { id: 'c3', symbol: 'SOL', name: 'Solana', assetClass: 'Crypto', price: 145.20, change24h: 8.5, riskLevel: 'Very High', description: 'High-performance, low-cost L1 blockchain.', roiAlgorithm: 'Speculative premium based on transaction throughput and ecosystem developer growth.' },
  { id: 'c4', symbol: 'ADA', name: 'Cardano', assetClass: 'Crypto', price: 0.45, change24h: 2.1, riskLevel: 'Very High', description: 'Peer-reviewed, academic-driven blockchain.', roiAlgorithm: 'Long-term holding based on institutional partnerships and methodical upgrades.' },
  { id: 'c5', symbol: 'DOT', name: 'Polkadot', assetClass: 'Crypto', price: 7.20, change24h: 3.4, riskLevel: 'Very High', description: 'Interoperability protocol connecting blockchains.', roiAlgorithm: 'Driven by parachain auction demand and developer ecosystem health.' },
  { id: 'c6', symbol: 'LINK', name: 'Chainlink', assetClass: 'Crypto', price: 14.80, change24h: -1.2, riskLevel: 'Very High', description: 'Decentralized oracle network connecting smart contracts to real-world data.', roiAlgorithm: 'Value scales linearly with the total value secured across all integrated DeFi protocols.' },
  { id: 'c7', symbol: 'MATIC', name: 'Polygon', assetClass: 'Crypto', price: 0.70, change24h: 1.5, riskLevel: 'Very High', description: 'Ethereum scaling solution.', roiAlgorithm: 'Utility token value tied to Ethereum network congestion and L2 adoption rates.' },
  { id: 'c8', symbol: 'AVAX', name: 'Avalanche', assetClass: 'Crypto', price: 35.60, change24h: 4.8, riskLevel: 'Very High', description: 'High-throughput, scalable smart contract platform.', roiAlgorithm: 'Growth driven by enterprise subnet adoption and cross-chain messaging volume.' },

  // Fixed Income
  { id: 'f1', symbol: 'US10Y', name: 'US Treasury 10-Year', assetClass: 'Fixed Income', price: 100.00, change24h: -0.1, riskLevel: 'Low', description: 'Government-backed debt security.', roiAlgorithm: 'Guaranteed fixed yield (currently ~4.5%) if held to maturity. Inverse price relationship to prevailing interest rates.' },
  { id: 'f2', symbol: 'LQD', name: 'iShares iBoxx Inv Grade Corp Bond', assetClass: 'Fixed Income', price: 105.40, change24h: 0.2, riskLevel: 'Low', description: 'ETF tracking US investment-grade corporate bonds.', roiAlgorithm: 'Generates yield from blue-chip corporate debt. Mild risk of default compared to government bonds.' },
  { id: 'f3', symbol: 'HYG', name: 'iShares iBoxx High Yield Corp Bond', assetClass: 'Fixed Income', price: 77.20, change24h: 0.4, riskLevel: 'Medium', description: 'ETF tracking high-yield (junk) corporate bonds.', roiAlgorithm: 'Higher yield compensates for increased default risk. Highly correlated with equity markets.' },
  { id: 'f4', symbol: 'BND', name: 'Vanguard Total Bond Market', assetClass: 'Fixed Income', price: 72.10, change24h: 0.1, riskLevel: 'Low', description: 'Broad exposure to US investment-grade bonds.', roiAlgorithm: 'Stable, predictable income stream. Portfolio stabilizer during market downturns.' },
  { id: 'f5', symbol: 'MUB', name: 'iShares National Muni Bond', assetClass: 'Fixed Income', price: 106.80, change24h: 0.05, riskLevel: 'Low', description: 'Tax-exempt municipal bonds.', roiAlgorithm: 'Tax-adjusted returns highly favorable for high-net-worth individuals in top tax brackets.' },

  // Commodities
  { id: 'co1', symbol: 'GLD', name: 'SPDR Gold Trust', assetClass: 'Commodities', price: 215.30, change24h: 0.7, riskLevel: 'Low', description: 'Tracks the price of physical gold.', roiAlgorithm: 'Acts as a hedge against inflation and currency debasement. Non-yielding, relies entirely on capital appreciation.' },
  { id: 'co2', symbol: 'SLV', name: 'iShares Silver Trust', assetClass: 'Commodities', price: 26.40, change24h: 1.2, riskLevel: 'Medium', description: 'Tracks the price of physical silver.', roiAlgorithm: 'Hybrid precious and industrial metal. More volatile than gold due to industrial demand cycles.' },
  { id: 'co3', symbol: 'USO', name: 'United States Oil Fund', assetClass: 'Commodities', price: 78.50, change24h: -1.5, riskLevel: 'High', description: 'Tracks the price of West Texas Intermediate (WTI) light, sweet crude oil.', roiAlgorithm: 'Highly sensitive to geopolitical events, OPEC+ production quotas, and global manufacturing demand.' },
  { id: 'co4', symbol: 'WEAT', name: 'Teucrium Wheat Fund', assetClass: 'Commodities', price: 5.40, change24h: 2.1, riskLevel: 'High', description: 'Tracks wheat futures contracts.', roiAlgorithm: 'Driven by weather patterns, global harvest yields, and agricultural supply chain disruptions.' },
  { id: 'co5', symbol: 'CPER', name: 'United States Copper Index Fund', assetClass: 'Commodities', price: 28.10, change24h: 1.8, riskLevel: 'Medium', description: 'Tracks copper futures.', roiAlgorithm: 'The "PhD of economics" - closely tracks global economic expansion and electrification trends.' },

  // Real Estate
  { id: 're1', symbol: 'VNQ', name: 'Vanguard Real Estate Index Fund', assetClass: 'Real Estate', price: 82.50, change24h: 0.3, riskLevel: 'Medium', description: 'Broad exposure to US equity REITs.', roiAlgorithm: 'Generates returns through commercial rent collection and property value appreciation. Sensitive to interest rates.' },
  { id: 're2', symbol: 'O', name: 'Realty Income Corp.', assetClass: 'Real Estate', price: 55.20, change24h: 0.1, riskLevel: 'Low', description: '"The Monthly Dividend Company", focusing on freestanding retail properties.', roiAlgorithm: 'Predictable, long-term triple-net leases provide highly stable monthly dividend yields.' },
  { id: 're3', symbol: 'PLD', name: 'Prologis Inc.', assetClass: 'Real Estate', price: 110.80, change24h: 0.6, riskLevel: 'Medium', description: 'Global leader in logistics real estate (warehouses).', roiAlgorithm: 'Driven by e-commerce growth and supply chain modernization. High occupancy rates drive rent growth.' },
  { id: 're4', symbol: 'AMT', name: 'American Tower Corp.', assetClass: 'Real Estate', price: 185.30, change24h: -0.2, riskLevel: 'Medium', description: 'Owns and operates wireless and broadcast communications infrastructure.', roiAlgorithm: 'Scales with global mobile data usage and 5G network rollouts.' },
  { id: 're5', symbol: 'EQIX', name: 'Equinix Inc.', assetClass: 'Real Estate', price: 805.10, change24h: 1.1, riskLevel: 'Medium', description: 'Global data center real estate investment trust.', roiAlgorithm: 'Growth powered by cloud computing, AI data storage needs, and enterprise digital transformation.' },
  // More Equities
  { id: 'a13', symbol: 'NFLX', name: 'Netflix Inc.', assetClass: 'Equities', price: 620.10, change24h: 1.2, riskLevel: 'High', description: 'Global streaming entertainment service.', roiAlgorithm: 'Driven by subscriber growth and content production costs.' },
  { id: 'a14', symbol: 'DIS', name: 'Walt Disney Co.', assetClass: 'Equities', price: 110.50, change24h: -0.8, riskLevel: 'Medium', description: 'Diversified multinational mass media and entertainment.', roiAlgorithm: 'Earnings tied to theme park attendance and streaming profitability.' },
  { id: 'a15', symbol: 'PYPL', name: 'PayPal Holdings', assetClass: 'Equities', price: 65.30, change24h: 0.4, riskLevel: 'Medium', description: 'Digital payments system operator.', roiAlgorithm: 'Total payment volume and take-rate margins.' },
  { id: 'a16', symbol: 'INTC', name: 'Intel Corp.', assetClass: 'Equities', price: 35.80, change24h: -1.5, riskLevel: 'Medium', description: 'Semiconductor chip manufacturer.', roiAlgorithm: 'Foundry success and PC market cyclicality.' },
  { id: 'a17', symbol: 'AMD', name: 'Advanced Micro Devices', assetClass: 'Equities', price: 160.20, change24h: 2.1, riskLevel: 'High', description: 'Semiconductor company producing CPUs and GPUs.', roiAlgorithm: 'Datacenter market share gains against competitors.' },
  { id: 'a18', symbol: 'BA', name: 'Boeing Co.', assetClass: 'Equities', price: 190.50, change24h: 0.1, riskLevel: 'High', description: 'Aerospace and defense corporation.', roiAlgorithm: 'Aircraft delivery rates and defense contract awards.' },
  { id: 'a19', symbol: 'KO', name: 'Coca-Cola Co.', assetClass: 'Equities', price: 62.40, change24h: 0.2, riskLevel: 'Low', description: 'Multinational beverage corporation.', roiAlgorithm: 'Steady dividend payer. Defensive consumer staple.' },
  { id: 'a20', symbol: 'PEP', name: 'PepsiCo Inc.', assetClass: 'Equities', price: 172.80, change24h: -0.1, riskLevel: 'Low', description: 'Food, snack, and beverage corporation.', roiAlgorithm: 'Pricing power and brand loyalty stability.' },

  // More Crypto
  { id: 'c9', symbol: 'XRP', name: 'Ripple', assetClass: 'Crypto', price: 0.60, change24h: -0.5, riskLevel: 'Very High', description: 'Digital payment protocol for cross-border transactions.', roiAlgorithm: 'Institutional banking partnerships and regulatory clarity.' },
  { id: 'c10', symbol: 'DOGE', name: 'Dogecoin', assetClass: 'Crypto', price: 0.15, change24h: 5.5, riskLevel: 'Very High', description: 'Meme cryptocurrency with strong community.', roiAlgorithm: 'Speculative retail trading and social media sentiment.' },
  { id: 'c11', symbol: 'UNI', name: 'Uniswap', assetClass: 'Crypto', price: 8.40, change24h: 1.2, riskLevel: 'Very High', description: 'Decentralized crypto exchange protocol.', roiAlgorithm: 'DEX trading volumes and protocol fee switches.' },
  { id: 'c12', symbol: 'ATOM', name: 'Cosmos', assetClass: 'Crypto', price: 9.10, change24h: 0.8, riskLevel: 'Very High', description: 'Interoperability network of blockchains.', roiAlgorithm: 'Appchain adoption and inter-blockchain communication volume.' },
  { id: 'c13', symbol: 'LTC', name: 'Litecoin', assetClass: 'Crypto', price: 85.50, change24h: -1.1, riskLevel: 'Very High', description: 'Peer-to-peer cryptocurrency, silver to Bitcoins gold.', roiAlgorithm: 'Transactional utility and alternative store of value.' },

  // More Commodities
  { id: 'co6', symbol: 'CORN', name: 'Teucrium Corn Fund', assetClass: 'Commodities', price: 21.30, change24h: 0.5, riskLevel: 'Medium', description: 'Tracks corn futures contracts.', roiAlgorithm: 'Agricultural yields and ethanol demand.' },
  { id: 'co7', symbol: 'PALL', name: 'Aberdeen Standard Palladium', assetClass: 'Commodities', price: 95.20, change24h: -2.3, riskLevel: 'High', description: 'Physical palladium trust.', roiAlgorithm: 'Automotive industry demand for catalytic converters.' },
  { id: 'co8', symbol: 'UGA', name: 'United States Gasoline Fund', assetClass: 'Commodities', price: 68.40, change24h: 1.1, riskLevel: 'High', description: 'Tracks gasoline futures.', roiAlgorithm: 'Consumer driving trends and refinery capacities.' },
  { id: 'co9', symbol: 'SOYB', name: 'Teucrium Soybean Fund', assetClass: 'Commodities', price: 25.10, change24h: 0.2, riskLevel: 'Medium', description: 'Tracks soybean futures.', roiAlgorithm: 'Global food demand and international trade tariffs.' },

  // More Real Estate
  { id: 're6', symbol: 'SPG', name: 'Simon Property Group', assetClass: 'Real Estate', price: 150.20, change24h: 0.8, riskLevel: 'Medium', description: 'Premier shopping mall operator.', roiAlgorithm: 'Retail tenant sales per square foot and occupancy.' },
  { id: 're7', symbol: 'WY', name: 'Weyerhaeuser Co.', assetClass: 'Real Estate', price: 32.50, change24h: 0.4, riskLevel: 'Medium', description: 'Timberland real estate investment trust.', roiAlgorithm: 'Lumber prices and housing construction starts.' },
  { id: 're8', symbol: 'DLR', name: 'Digital Realty Trust', assetClass: 'Real Estate', price: 145.80, change24h: 1.5, riskLevel: 'Medium', description: 'Data center solutions provider.', roiAlgorithm: 'Cloud infrastructure expansion and enterprise IT spending.' }
];

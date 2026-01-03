import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const PAGE_TITLE = 'Investor Pitch Deck | DePIN Connect';

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  const slides = [
    // Slide 1: Cover
    {
      id: 1,
      title: 'DePIN Connect',
      subtitle: 'Monetizing the Internet of Things',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <img src="/logo.svg" alt="DePIN Connect" className="w-32 h-32 animate-pulse" />
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent-pink to-primary bg-clip-text text-transparent">
            DePIN Connect
          </h1>
          <p className="text-3xl md:text-4xl text-white font-medium">
            Monetizing the Internet of Things
          </p>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
            Pay-Per-Second IoT Data Marketplace on Cronos Blockchain
          </p>
          <a 
            href="https://de-pin-connect.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg text-primary hover:text-accent-pink transition-colors"
          >
            🌐 Live Demo: de-pin-connect.vercel.app
          </a>
        </div>
      ),
    },
    // Slide 2: The Problem
    {
      id: 2,
      title: 'The Problem',
      subtitle: '95% of sensor data never monetized',
      content: (
        <div className="grid md:grid-cols-2 gap-12 h-full">
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Market Context</h3>
              <p className="text-xl text-gray-300">
                <span className="text-primary font-bold text-3xl">40 billion</span> IoT devices by 2025
              </p>
              <p className="text-lg text-gray-400 mt-2">Generating petabytes of data daily</p>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
              <p className="text-3xl font-bold text-red-400 mb-2">95% wasted value</p>
              <p className="text-gray-300">Sensor data never monetized</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">Key Pain Points</h3>
            {[
              "Providers can't easily sell real-time data",
              "Buyers face high fees (30-40%) and vendor lock-in",
              "Monthly subscriptions for sporadic data needs",
              "No trustless payment mechanism",
              "Complex integrations and legal contracts"
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-800/30 p-4 rounded-xl">
                <span className="text-2xl">❌</span>
                <p className="text-lg text-gray-200">{point}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 3: Our Solution
    {
      id: 3,
      title: 'Our Solution',
      subtitle: 'Decentralized IoT + Blockchain + x402 Protocol',
      content: (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-primary/20 to-accent-pink/20 p-8 rounded-2xl border border-primary/30">
            <h3 className="text-3xl font-bold text-white mb-6">Core Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: '🌐', title: 'Interactive Marketplace', desc: 'Map-based device discovery' },
                { icon: '⚡', title: 'Pay-Per-Second', desc: 'No subscriptions, pay for usage' },
                { icon: '🔓', title: 'x402 Protocol', desc: 'HTTP 402 + blockchain verification' },
                { icon: '🤖', title: 'AI Agent', desc: 'Quality assurance & monitoring' },
                { icon: '💰', title: 'Instant Settlement', desc: 'Smart contract automation' },
              ].map((feature, i) => (
                <div key={i} className="bg-gray-800/50 p-4 rounded-xl">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h4 className="text-xl font-bold text-white">{feature.title}</h4>
                  <p className="text-gray-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl text-center">
            <p className="text-2xl font-bold text-green-400">
              🎯 The Magic: First platform combining blockchain payment streams with HTTP 402
            </p>
          </div>
        </div>
      ),
    },
    // Slide 4: How It Works
    {
      id: 4,
      title: 'How It Works',
      subtitle: 'Two-Sided Marketplace',
      content: (
        <div className="grid md:grid-cols-2 gap-8 h-full">
          <div className="bg-blue-500/10 border border-blue-500/30 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">💵</span> For Data Providers (Earn)
            </h3>
            <div className="space-y-4">
              {[
                'Register IoT device (weather, traffic, air quality)',
                'Set price (e.g., 0.001 CRO/second)',
                'Earn passive income 24/7'
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-blue-400">{i + 1}.</span>
                  <p className="text-lg text-gray-200">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span> For Data Buyers (Access)
            </h3>
            <div className="space-y-4">
              {[
                'Browse marketplace on interactive map',
                'Subscribe with crypto deposit (10 CRO = 3 hours)',
                'Access real-time data via API with x402 headers',
                'Stop anytime, automatic refund'
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-purple-400">{i + 1}.</span>
                  <p className="text-lg text-gray-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 5: Market & Business Model
    {
      id: 5,
      title: 'Market Opportunity',
      subtitle: '$73B market with clear path to $6M ARR',
      content: (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Total Addressable Market</h3>
            {[
              { label: 'IoT Data Market', value: '$73B by 2026', growth: '25% CAGR' },
              { label: 'Smart City Data', value: '$45B by 2027', growth: '' },
              { label: 'DePIN Sector', value: '$2.2T potential', growth: '' },
            ].map((market, i) => (
              <div key={i} className="bg-gradient-to-r from-primary/20 to-transparent p-6 rounded-xl border border-primary/30">
                <p className="text-gray-400 text-sm">{market.label}</p>
                <p className="text-3xl font-bold text-white">{market.value}</p>
                {market.growth && <p className="text-green-400">{market.growth}</p>}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Revenue Model</h3>
            {[
              { icon: '📊', label: 'Platform Fee', value: '2.5% on transactions' },
              { icon: '⭐', label: 'Premium Listings', value: '$50-200/month' },
              { icon: '🏢', label: 'Enterprise Plans', value: '$500-5K/month' },
              { icon: '📈', label: 'Data Analytics', value: 'Subscription' },
            ].map((revenue, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl">
                <span className="text-3xl">{revenue.icon}</span>
                <div>
                  <p className="font-bold text-white">{revenue.label}</p>
                  <p className="text-gray-400">{revenue.value}</p>
                </div>
              </div>
            ))}

            <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl mt-6">
              <p className="text-sm text-gray-400">Year 1 Target</p>
              <p className="text-2xl font-bold text-green-400">$6M ARR potential</p>
              <p className="text-gray-300 text-sm mt-1">10,000 devices × $50/month average</p>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 6: Technology
    {
      id: 6,
      title: 'Technology & Innovation',
      subtitle: 'x402 Protocol: HTTP 402 + Blockchain',
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Tech Stack</h3>
              <div className="space-y-3">
                {[
                  { label: 'Smart Contracts', value: 'Solidity 0.8.20 on Cronos' },
                  { label: 'Frontend', value: 'React + TypeScript + Vite' },
                  { label: 'Blockchain', value: 'Cronos Testnet → Mainnet' },
                  { label: 'Future', value: 'x402 Data API Server' },
                ].map((tech, i) => (
                  <div key={i}>
                    <span className="text-primary font-semibold">{tech.label}:</span>
                    <span className="text-gray-300 ml-2">{tech.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/20 to-accent-pink/20 p-6 rounded-2xl border border-primary/30">
              <h3 className="text-xl font-bold text-white mb-4">x402 Innovation</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-red-400 font-semibold mb-2">❌ Traditional:</p>
                  <code className="text-gray-300 text-xs">GET /data → API Key → Monthly Bill</code>
                </div>
                <div>
                  <p className="text-green-400 font-semibold mb-2">✅ x402:</p>
                  <code className="text-gray-300 text-xs">
                    GET /data + Wallet → Smart Contract<br/>
                    → Active Stream? → Data OR 402
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 p-6 rounded-xl">
            <h4 className="text-lg font-bold text-white mb-3">Deployed Contracts</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">DePINRegistry:</span>
                <code className="text-primary block mt-1 text-xs break-all">
                  0xfd2f67cD...30d133A
                </code>
              </div>
              <div>
                <span className="text-gray-400">PaymentStream:</span>
                <code className="text-primary block mt-1 text-xs break-all">
                  0xA5dd225B...7d23737
                </code>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 7: Traction & Roadmap
    {
      id: 7,
      title: 'Traction & Roadmap',
      subtitle: 'MVP Complete → Mainnet Launch',
      content: (
        <div className="space-y-8">
          <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl">
            <h3 className="text-2xl font-bold text-green-400 mb-4">✅ Phase 1: Completed</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Smart contracts deployed and tested',
                'Live marketplace (Vercel)',
                'Payment streaming functional',
                'AI agent monitoring',
                'Device registration working',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-blue-400 mb-4">🚧 Next 90 Days (Phase 2)</h3>
              <ul className="space-y-2 text-gray-200">
                <li>• x402 Data API server (2 weeks)</li>
                <li>• Real IoT device integration (4 weeks)</li>
                <li>• 10+ pilot devices onboarded</li>
                <li>• Beta user program (50 buyers)</li>
              </ul>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-purple-400 mb-4">🎯 Q1-Q2 2026 (Phase 3-4)</h3>
              <ul className="space-y-2 text-gray-200">
                <li>• Cronos Mainnet deployment</li>
                <li>• 1,000+ devices target</li>
                <li>• Mobile apps (iOS/Android)</li>
                <li>• Cross-chain expansion</li>
                <li>• Enterprise features</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 8: The Ask
    {
      id: 8,
      title: 'The Ask',
      subtitle: '$500K Seed Round',
      content: (
        <div className="grid md:grid-cols-2 gap-8 h-full">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/20 to-accent-pink/20 p-8 rounded-2xl border border-primary/30">
              <h3 className="text-3xl font-bold text-white mb-4">
                The "Airbnb for IoT Data"
              </h3>
              <div className="space-y-3">
                <p className="text-xl text-gray-200">
                  <span className="text-primary font-bold">$73B market</span> opportunity
                </p>
                <p className="text-xl text-gray-200">
                  Path to <span className="text-green-400 font-bold">$6M ARR</span> in Year 1
                </p>
                <p className="text-lg text-gray-300">
                  First mover in x402 + blockchain + IoT
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-white mb-3">Competitive Advantage</h4>
              <div className="space-y-2">
                {[
                  '10x cheaper than AWS/Azure IoT',
                  'Real-time vs. batch data',
                  'Multi-vertical vs. single use',
                  'Network effects moat',
                ].map((adv, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-200">{adv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-green-400 mb-6">Raising: $500K</h3>
              <h4 className="text-lg font-bold text-white mb-4">Use of Funds:</h4>
              <div className="space-y-3">
                {[
                  { label: 'Product Development', value: '40%' },
                  { label: 'Device Partnerships', value: '30%' },
                  { label: 'Marketing', value: '20%' },
                  { label: 'Operations', value: '10%' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-200">{item.label}</span>
                    <span className="font-bold text-white text-lg">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl text-center">
              <p className="text-sm text-gray-400 mb-2">Contact</p>
              <p className="text-primary font-semibold">
                de-pin-connect.vercel.app
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-pink rounded-full filter blur-3xl"></div>
      </div>

      {/* Main Slide Container */}
      <div className="relative z-10 h-screen flex flex-col p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">{currentSlideData.title}</h2>
            <p className="text-gray-400 text-lg">{currentSlideData.subtitle}</p>
          </div>
          <div className="text-gray-400">
            Slide {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-auto">
          {currentSlideData.content}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Previous
          </Button>

          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-primary w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;

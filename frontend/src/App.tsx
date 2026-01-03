import React from 'react';
import MapView from './components/MapView';
import Header from './components/layout/Header';
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider>
      <div className="bg-gray-900 min-h-screen text-white">
        <Header />
        <main className="p-4">
          {/* The main content will go here. For now, we can add a placeholder */}
          <h1 className="text-2xl font-bold text-center text-blue-400 mb-8">Welcome to DePIN Connect</h1>
          {/* We will uncomment this later when we build the MapView component */}
          {/* <MapView /> */}
        </main>
      </div>
    </WalletProvider>
  );
}

export default App;

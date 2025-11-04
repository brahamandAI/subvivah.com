import React from 'react';
import KundliGenerator from './components/KundliGenerator';
import { ZodiacProvider } from './context/ZodiacContext';

function App() {
  return (
    <ZodiacProvider>
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 text-white">
        <KundliGenerator />
      </div>
    </ZodiacProvider>
  );
}

export default App;
import React, { useState } from 'react';
import { Calculator } from './components/Calculator';
import { FunctionSquare as Function, Instagram as Integral, HardDrive as Derivative, Sigma } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'derivative' | 'integral' | 'limit'>('derivative');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Calculus Calculator</h1>
          <p className="text-gray-600">Calculate derivatives, integrals, and limits with ease</p>
        </header>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${
                activeTab === 'derivative' ? 'bg-indigo-100 text-indigo-800 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('derivative')}
            >
              <Derivative size={20} />
              Derivatives
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${
                activeTab === 'integral' ? 'bg-indigo-100 text-indigo-800 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('integral')}
            >
              <Integral size={20} />
              Integrals
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${
                activeTab === 'limit' ? 'bg-indigo-100 text-indigo-800 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('limit')}
            >
              <Function size={20} />
              Limits
            </button>
          </div>

          <div className="p-6">
            <Calculator activeTab={activeTab} />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Calculus Calculator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
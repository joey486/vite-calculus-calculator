import React, { useState } from 'react';
import { evaluate, derivative, parse, simplify } from 'mathjs';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface CalculatorProps {
  activeTab: 'derivative' | 'integral' | 'limit';
}

export const Calculator: React.FC<CalculatorProps> = ({ activeTab }) => {
  const [expression, setExpression] = useState('');
  const [variable, setVariable] = useState('x');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');
  const [limitPoint, setLimitPoint] = useState('');
  const [history, setHistory] = useState<Array<{ type: string; input: string; result: string }>>([]);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    try {
      if (!expression.trim()) {
        throw new Error('Please enter an expression');
      }

      let calculatedResult = '';
      let historyType = '';
      let historyInput = '';

      switch (activeTab) {
        case 'derivative':
          if (!variable.trim()) {
            throw new Error('Please enter a variable');
          }
          
          const derivativeResult = derivative(expression, variable).toString();
          calculatedResult = derivativeResult;
          historyType = 'Derivative';
          historyInput = `\\frac{d}{d${variable}}(${expression})`;
          break;

        case 'integral':
          if (!variable.trim()) {
            throw new Error('Please enter a variable');
          }

          // For definite integrals
          if (lowerBound && upperBound) {
            try {
              // Numerical integration using the trapezoidal rule
              const steps = 1000;
              const range = parseFloat(upperBound) - parseFloat(lowerBound);
              const stepSize = range / steps;
              let sum = 0;

              for (let i = 0; i <= steps; i++) {
                const x = parseFloat(lowerBound) + i * stepSize;
                const weight = (i === 0 || i === steps) ? 0.5 : 1;
                const substituted = expression.replace(new RegExp(variable, 'g'), `(${x})`);
                sum += weight * evaluate(substituted);
              }

              calculatedResult = (sum * stepSize).toFixed(6);
              historyType = 'Definite Integral';
              historyInput = `\\int_{${lowerBound}}^{${upperBound}} ${expression} \\, d${variable}`;
            } catch (e) {
              throw new Error('Error calculating definite integral. Check your expression and bounds.');
            }
          } else {
            // For indefinite integrals, we'll provide a message since symbolic integration is complex
            calculatedResult = 'Symbolic integration is not supported. Please use definite integrals with bounds.';
            historyType = 'Indefinite Integral';
            historyInput = `\\int ${expression} \\, d${variable}`;
          }
          break;

        case 'limit':
          if (!limitPoint.trim()) {
            throw new Error('Please enter a limit point');
          }
          if (!variable.trim()) {
            throw new Error('Please enter a variable');
          }

          try {
            // Numerical approximation of limit
            const epsilon = 0.0001;
            const point = parseFloat(limitPoint);
            
            // Evaluate at points very close to the limit point
            const leftExpr = expression.replace(new RegExp(variable, 'g'), `(${point - epsilon})`);
            const rightExpr = expression.replace(new RegExp(variable, 'g'), `(${point + epsilon})`);
            
            const leftValue = evaluate(leftExpr);
            const rightValue = evaluate(rightExpr);
            
            // If left and right limits are close, we assume the limit exists
            if (Math.abs(leftValue - rightValue) < epsilon) {
              calculatedResult = rightValue.toFixed(6);
            } else {
              calculatedResult = 'Limit may not exist or is discontinuous at this point';
            }
            
            historyType = 'Limit';
            historyInput = `\\lim_{${variable} \\to ${limitPoint}} ${expression}`;
          } catch (e) {
            throw new Error('Error calculating limit. Check your expression and limit point.');
          }
          break;
      }

      setResult(calculatedResult);
      setHistory([...history, { type: historyType, input: historyInput, result: calculatedResult }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleClear = () => {
    setExpression('');
    setVariable('x');
    setResult(null);
    setError(null);
    setLowerBound('');
    setUpperBound('');
    setLimitPoint('');
  };

  const renderInputFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="expression" className="block text-sm font-medium text-gray-700 mb-1">
            Expression (e.g., x^2 + 2*x + 1)
          </label>
          <input
            id="expression"
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter a mathematical expression"
          />
        </div>

        <div>
          <label htmlFor="variable" className="block text-sm font-medium text-gray-700 mb-1">
            Variable
          </label>
          <input
            id="variable"
            type="text"
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Variable (default: x)"
          />
        </div>

        {activeTab === 'integral' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lowerBound" className="block text-sm font-medium text-gray-700 mb-1">
                Lower Bound (optional)
              </label>
              <input
                id="lowerBound"
                type="text"
                value={lowerBound}
                onChange={(e) => setLowerBound(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Lower bound"
              />
            </div>
            <div>
              <label htmlFor="upperBound" className="block text-sm font-medium text-gray-700 mb-1">
                Upper Bound (optional)
              </label>
              <input
                id="upperBound"
                type="text"
                value={upperBound}
                onChange={(e) => setUpperBound(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Upper bound"
              />
            </div>
          </div>
        )}

        {activeTab === 'limit' && (
          <div>
            <label htmlFor="limitPoint" className="block text-sm font-medium text-gray-700 mb-1">
              Limit Point (as {variable} approaches)
            </label>
            <input
              id="limitPoint"
              type="text"
              value={limitPoint}
              onChange={(e) => setLimitPoint(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter limit point"
            />
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Calculate
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (error) {
      return (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      );
    }

    if (result) {
      let latexExpression = '';
      
      switch (activeTab) {
        case 'derivative':
          latexExpression = `\\frac{d}{d${variable}}(${expression}) = ${result}`;
          break;
        case 'integral':
          if (lowerBound && upperBound) {
            latexExpression = `\\int_{${lowerBound}}^{${upperBound}} ${expression} \\, d${variable} = ${result}`;
          } else {
            latexExpression = `\\int ${expression} \\, d${variable} \\approx ${result}`;
          }
          break;
        case 'limit':
          latexExpression = `\\lim_{${variable} \\to ${limitPoint}} ${expression} = ${result}`;
          break;
      }

      return (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start mb-2">
            <CheckCircle2 className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <h3 className="font-medium text-green-800">Result</h3>
          </div>
          <div className="mt-2 overflow-x-auto">
            <BlockMath math={latexExpression} />
          </div>
        </div>
      );
    }

    return null;
  };

  const renderHistory = () => {
    if (history.length === 0) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Calculation History</h3>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {history.map((item, index) => (
            <div 
              key={index} 
              className={`p-3 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200 last:border-b-0`}
            >
              <p className="text-sm text-gray-500 mb-1">{item.type}</p>
              <div className="flex justify-between items-center">
                <div className="overflow-x-auto">
                  <InlineMath math={item.input} />
                </div>
                <div className="text-indigo-600 font-medium ml-4">= {item.result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderInputFields()}
      {renderResult()}
      {renderHistory()}
    </div>
  );
};
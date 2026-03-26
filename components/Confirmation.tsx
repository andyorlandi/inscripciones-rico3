'use client';

import { useState } from 'react';

interface ConfirmationProps {
  name: string;
  code: string;
  onBack: () => void;
}

export default function Confirmation({ name, code, onBack }: ConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card text-center space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full">
          <svg className="w-14 h-14 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          ¡Listo, {name.split(' ')[0]}!
        </h1>

        <p className="text-lg text-gray-600">
          Tu inscripción fue exitosa
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8 space-y-5">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Tu código personal
        </p>

        <div className="text-5xl font-bold text-primary-600 tracking-wider font-mono">
          {code}
        </div>

        <button
          onClick={handleCopy}
          className={`btn-secondary transition-all ${copied ? 'bg-primary-500 text-white border-primary-500' : ''}`}
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar código
            </>
          )}
        </button>

        <p className="text-sm text-gray-600 leading-relaxed">
          Guardá este código. Lo vas a necesitar más adelante.
        </p>
      </div>

      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
      >
        ← Volver al inicio
      </button>
    </div>
  );
}

'use client';

import { useState, FormEvent } from 'react';

interface CheckStatusProps {
  onBack: () => void;
}

export default function CheckStatus({ onBack }: CheckStatusProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState<{
    name: string;
    personal_code: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStudentData(null);

    try {
      const response = await fetch(`/api/students/check-status?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar el estado');
      }

      setStudentData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Volver
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Verificar estado de inscripción
      </h2>

      {!studentData ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="label">
              Ingresá tu mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="tu.email@ejemplo.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
            <p className="text-green-800 font-medium">
              Ya estás inscripto/a, {studentData.name.split(' ')[0]}!
            </p>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                Tu código personal es:
              </p>
              <p className="text-2xl font-bold text-primary-700">
                {studentData.personal_code}
              </p>
            </div>

            <p className="text-sm text-gray-600">
              Las comisiones todavía no fueron publicadas. Te vamos a notificar cuando estén listas.
            </p>
          </div>

          <button
            onClick={onBack}
            className="btn-secondary w-full"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}

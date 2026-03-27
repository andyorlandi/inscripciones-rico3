'use client';

import { useState, useEffect } from 'react';
import StudentsList from './StudentsList';
import CommissionsPreview from './CommissionsPreview';

interface AdminDashboardProps {
  password: string;
  onLogout: () => void;
}

interface DashboardData {
  appState: {
    registration_open: number;
  };
  stats: {
    total: number;
    avgScore: number;
    recursantes: number;
  };
  students: any[];
}

export default function AdminDashboard({ password, onLogout }: AdminDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commissions, setCommissions] = useState<any[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [password]);

  const handleToggleRegistration = async () => {
    try {
      const response = await fetch('/api/admin/toggle-registration', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDistribute = async () => {
    try {
      const response = await fetch('/api/admin/distribute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al distribuir');
      }

      const result = await response.json();
      setCommissions(result.commissions);
      setShowPreview(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveDistribution = async (assignments: any[]) => {
    try {
      const response = await fetch('/api/admin/save-distribution', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignments })
      });

      if (!response.ok) {
        throw new Error('Error al guardar');
      }

      alert('Distribución guardada exitosamente');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExport = () => {
    window.open(`/api/admin/export?auth=${encodeURIComponent(password)}`, '_blank');
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Error al cargar datos'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <button
            onClick={onLogout}
            className="btn-secondary"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total de inscriptos
            </h3>
            <p className="text-3xl font-bold text-primary-700">
              {data.stats.total}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Score promedio
            </h3>
            <p className="text-3xl font-bold text-primary-700">
              {data.stats.avgScore}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Recursantes
            </h3>
            <p className="text-3xl font-bold text-primary-700">
              {data.stats.recursantes}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Controles
          </h2>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleToggleRegistration}
              className={`btn ${
                data.appState.registration_open
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {data.appState.registration_open ? 'Cerrar registro' : 'Abrir registro'}
            </button>

            <button
              onClick={handleDistribute}
              className="btn-primary"
              disabled={data.stats.total === 0}
            >
              Distribuir en comisiones
            </button>

            <button
              onClick={handleExport}
              className="btn-secondary"
              disabled={data.stats.total === 0}
            >
              Exportar Excel
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Estado del registro:{' '}
            <span className={`font-medium ${data.appState.registration_open ? 'text-green-600' : 'text-red-600'}`}>
              {data.appState.registration_open ? 'Abierto' : 'Cerrado'}
            </span>
          </p>
        </div>

        {/* Commissions Preview */}
        {showPreview && commissions && (
          <CommissionsPreview
            commissions={commissions}
            password={password}
            onSave={handleSaveDistribution}
            onClose={() => setShowPreview(false)}
          />
        )}

        {/* Students List */}
        {!showPreview && (
          <StudentsList
            students={data.students}
            password={password}
            onRefresh={fetchData}
          />
        )}
      </div>
    </main>
  );
}

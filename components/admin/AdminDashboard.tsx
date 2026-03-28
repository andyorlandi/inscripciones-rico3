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
    linking_enabled: number;
    commissions_published: number;
  };
  stats: {
    total: number;
    avgScore: number;
    recursantes: number;
    studentsWithCommission: number;
  };
  students: any[];
}

export default function AdminDashboard({ password, onLogout }: AdminDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commissions, setCommissions] = useState<any[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

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

  const handleToggleLinking = async () => {
    try {
      const response = await fetch('/api/admin/toggle-linking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
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

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/admin/groups', {
        headers: { 'Authorization': `Bearer ${password}` }
      });
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('¿Estás seguro de que querés eliminar este grupo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${password}` }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar grupo');
      }

      await fetchGroups();
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleCommissions = async () => {
    // If publishing, show confirmation dialog
    if (!data?.appState.commissions_published) {
      if (!confirm('¿Estás seguro/a? Los alumnos van a poder ver en qué comisión quedaron.')) {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/toggle-commissions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${password}` }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
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

        {/* Process Stepper */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estado del proceso</h2>

          <div className="flex items-center justify-between">
            {/* Step 1: Registration */}
            <div className="flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  !data.appState.registration_open ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {!data.appState.registration_open ? '✓' : '1'}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Registro</p>
                <p className="text-xs text-gray-600">
                  {data.appState.registration_open ? 'Abierto' : 'Cerrado'}
                </p>
              </div>
            </div>

            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>

            {/* Step 2: Linking */}
            <div className="flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  data.appState.linking_enabled ? 'bg-blue-500 text-white' :
                  !data.appState.registration_open ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
                }`}>
                  {data.appState.linking_enabled ? '2' : '-'}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Vinculación</p>
                <p className="text-xs text-gray-600">
                  {data.appState.linking_enabled ? 'Habilitada' : 'No habilitada'}
                </p>
              </div>
            </div>

            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>

            {/* Step 3: Distribution */}
            <div className="flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  (data.stats.studentsWithCommission || 0) > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {(data.stats.studentsWithCommission || 0) > 0 ? '✓' : '3'}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Distribución</p>
                <p className="text-xs text-gray-600">
                  {(data.stats.studentsWithCommission || 0) > 0 ? 'Completada' : 'Pendiente'}
                </p>
              </div>
            </div>

            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>

            {/* Step 4: Publication */}
            <div className="flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  data.appState.commissions_published ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {data.appState.commissions_published ? '✓' : '4'}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Publicación</p>
                <p className="text-xs text-gray-600">
                  {data.appState.commissions_published ? 'Publicadas' : 'No publicadas'}
                </p>
              </div>
            </div>
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
              onClick={handleToggleLinking}
              disabled={data.appState.registration_open === 1}
              className={`btn ${
                data.appState.linking_enabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } ${data.appState.registration_open === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {data.appState.linking_enabled ? 'Cerrar vinculación' : 'Habilitar vinculación'}
            </button>

            <button
              onClick={handleDistribute}
              className="btn-primary"
              disabled={data.stats.total === 0}
            >
              Distribuir en comisiones
            </button>

            <button
              onClick={handleToggleCommissions}
              disabled={(data.stats.studentsWithCommission || 0) === 0}
              className={`btn ${
                data.appState.commissions_published
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } ${(data.stats.studentsWithCommission || 0) === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {data.appState.commissions_published ? 'Despublicar comisiones' : 'Publicar comisiones'}
            </button>

            <button
              onClick={handleExport}
              className="btn-secondary"
              disabled={data.stats.total === 0}
            >
              Exportar Excel
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              Estado del registro:{' '}
              <span className={`font-medium ${data.appState.registration_open ? 'text-green-600' : 'text-red-600'}`}>
                {data.appState.registration_open ? 'Abierto' : 'Cerrado'}
              </span>
            </p>

            {data.appState.registration_open === 1 && (
              <p className="text-sm text-orange-600">
                Cerrá el registro antes de habilitar la vinculación
              </p>
            )}
          </div>
        </div>

        {/* Groups Management */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Grupos de afinidad</h2>
            <button
              onClick={() => {
                setShowGroups(!showGroups);
                if (!showGroups) fetchGroups();
              }}
              className="btn-secondary"
            >
              {showGroups ? 'Ocultar grupos' : 'Ver grupos'}
            </button>
          </div>

          {showGroups && (
            <div className="space-y-4">
              {groups.length === 0 ? (
                <p className="text-gray-600">No hay grupos formados aún</p>
              ) : (
                groups.map(group => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">Grupo #{group.id}</h3>
                        <p className="text-sm text-gray-600">
                          {group.members.length} integrantes • Score total: {group.totalScore}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="space-y-1">
                      {group.members.map((m: any) => (
                        <div key={m.id} className="text-sm flex items-center gap-2">
                          <span>{m.name} ({m.personalCode}) - Score: {m.score}</span>
                          {m.subgroupId && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                              Subgrupo {m.subgroupId}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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

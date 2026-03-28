'use client';

import { useState, useEffect, FormEvent } from 'react';
import GroupFormation from './GroupFormation';

interface CheckStatusProps {
  onBack: () => void;
}

export default function CheckStatus({ onBack }: CheckStatusProps) {
  const [email, setEmail] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [groupStatus, setGroupStatus] = useState<any>(null);
  const [appState, setAppState] = useState<any>(null);
  const [showGroupFormation, setShowGroupFormation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (studentEmail: string) => {
    setLoading(true);
    setError('');

    try {
      // 1. Check student status
      const studentRes = await fetch(`/api/students/check-status?email=${encodeURIComponent(studentEmail)}`);
      if (!studentRes.ok) {
        const data = await studentRes.json();
        throw new Error(data.error || 'No se encontró un estudiante con ese mail');
      }
      const studentData = await studentRes.json();
      setStudent(studentData);

      // 2. Get app state
      const appStateRes = await fetch('/api/app-state');
      const appStateData = await appStateRes.json();
      setAppState(appStateData);

      // 3. Get group status
      const groupRes = await fetch(`/api/groups/status?email=${encodeURIComponent(studentEmail)}`);
      const groupData = await groupRes.json();
      setGroupStatus(groupData);

    } catch (err: any) {
      setError(err.message);
      setStudent(null);
      setAppState(null);
      setGroupStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetchData(email);
  };

  const handleGroupFormationSuccess = () => {
    setShowGroupFormation(false);
    fetchData(email);
  };

  // Si está armando grupo
  if (showGroupFormation && student) {
    return (
      <GroupFormation
        creatorEmail={email}
        onSuccess={handleGroupFormationSuccess}
        onCancel={() => setShowGroupFormation(false)}
      />
    );
  }

  // Formulario de email
  if (!student) {
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
      </div>
    );
  }

  // Vista con datos del estudiante
  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ✓ Ya estás inscripto/a, {student.name.split(' ')[0]}!
        </h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <p className="text-sm text-gray-600 mb-2">Tu código personal es:</p>
        <p className="text-3xl font-bold font-mono text-center text-primary-700 mb-3">
          {student.personal_code}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(student.personal_code)}
          className="btn-secondary w-full"
        >
          Copiar código
        </button>
      </div>

      {/* Sección de vinculación */}
      {appState?.linking_enabled && !groupStatus?.inGroup && (
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Si querés anotarte con compañeros/as, tocá el botón de abajo.
            Si preferís ir solo/a, no hace falta que hagas nada.
          </p>
          <button
            onClick={() => setShowGroupFormation(true)}
            className="btn-primary w-full"
          >
            Armar grupo
          </button>
        </div>
      )}

      {/* Mostrar grupo si existe */}
      {groupStatus?.inGroup && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Tu grupo de afinidad:</h3>
          <div className="space-y-2">
            {groupStatus.group.members.map((member: any) => (
              <div key={member.id} className="bg-gray-50 rounded p-3">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-600">{member.personalCode}</p>
              </div>
            ))}
          </div>

          {groupStatus.needsSubdivision && groupStatus.isCreator && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-800 mb-3">
                Tu grupo tiene más de 3 personas. Necesitás subdividirlo en subgrupos de hasta 3.
              </p>
              <button className="btn-primary">
                Subdividir grupo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Commission Status */}
      {!student.commissions_published ? (
        <p className="text-sm text-gray-600 text-center mb-6">
          Las comisiones todavía no fueron publicadas. Te vamos a notificar cuando estén listas.
        </p>
      ) : student.commission ? (
        <div className="mb-6">
          {/* Commission Announcement */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white text-center mb-6">
            <p className="text-lg mb-2">¡Ya tenés comisión!</p>
            <h3 className="text-3xl font-bold mb-1">
              {student.commission_name}
            </h3>
          </div>

          {/* Classmates List */}
          <div>
            <h3 className="font-bold text-lg mb-3">Tus compañeros de comisión:</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {student.commission_classmates?.map((classmate: any, index: number) => (
                <div
                  key={index}
                  className={`rounded p-3 ${
                    classmate.same_subgroup
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <p className="font-medium">{classmate.name}</p>
                  {classmate.same_subgroup && (
                    <p className="text-xs text-blue-700 mt-1">
                      ✓ Tu compañero de subgrupo
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-center">
            Hubo un problema con tu asignación. Acercate a los docentes para resolverlo.
          </p>
        </div>
      )}

      <button onClick={onBack} className="btn-secondary w-full">
        ← Volver al inicio
      </button>
    </div>
  );
}

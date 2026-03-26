'use client';

import { useState } from 'react';

interface Commission {
  id: string;
  name: string;
  studentCount: number;
  totalScore: number;
  averageScore: number;
  recursantesCount: number;
  students: any[];
}

interface CommissionsPreviewProps {
  commissions: Commission[];
  password: string;
  onSave: (assignments: any[]) => void;
  onClose: () => void;
}

export default function CommissionsPreview({
  commissions: initialCommissions,
  password,
  onSave,
  onClose
}: CommissionsPreviewProps) {
  const [commissions, setCommissions] = useState(initialCommissions);

  const getCatedraDisplay = (catedra: string, otra: string | null) => {
    if (catedra === 'Otra' && otra) {
      return otra;
    }
    return catedra;
  };

  const moveStudent = (studentId: number, fromCommissionId: string, toCommissionId: string) => {
    const newCommissions = commissions.map(c => {
      if (c.id === fromCommissionId) {
        const student = c.students.find(s => s.id === studentId);
        if (!student) return c;

        const newStudents = c.students.filter(s => s.id !== studentId);
        const newTotalScore = c.totalScore - student.score;
        const newRecursantesCount = c.recursantesCount - (student.is_recursante ? 1 : 0);

        return {
          ...c,
          students: newStudents,
          studentCount: newStudents.length,
          totalScore: Math.round(newTotalScore * 10) / 10,
          averageScore: newStudents.length > 0
            ? Math.round((newTotalScore / newStudents.length) * 10) / 10
            : 0,
          recursantesCount: newRecursantesCount
        };
      }

      if (c.id === toCommissionId) {
        const fromCommission = commissions.find(com => com.id === fromCommissionId);
        const student = fromCommission?.students.find(s => s.id === studentId);
        if (!student) return c;

        const newStudents = [...c.students, student];
        const newTotalScore = c.totalScore + student.score;
        const newRecursantesCount = c.recursantesCount + (student.is_recursante ? 1 : 0);

        return {
          ...c,
          students: newStudents,
          studentCount: newStudents.length,
          totalScore: Math.round(newTotalScore * 10) / 10,
          averageScore: Math.round((newTotalScore / newStudents.length) * 10) / 10,
          recursantesCount: newRecursantesCount
        };
      }

      return c;
    });

    setCommissions(newCommissions);
  };

  const handleSave = () => {
    const assignments = commissions.flatMap(commission =>
      commission.students.map(student => ({
        studentId: student.id,
        commissionId: commission.id
      }))
    );

    onSave(assignments);
  };

  const handleExport = () => {
    window.open(`/api/admin/export?auth=${encodeURIComponent(password)}`, '_blank');
  };

  return (
    <div className="card">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Preview de comisiones
        </h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
        >
          ✕ Cerrar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {commissions.map((commission) => (
          <div key={commission.id} className="border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-lg text-primary-700 mb-3">
              {commission.name}
            </h3>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <span className="text-gray-600">Alumnos:</span>
                <span className="font-medium ml-1">{commission.studentCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Recursantes:</span>
                <span className="font-medium ml-1">{commission.recursantesCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Score total:</span>
                <span className="font-medium ml-1">{commission.totalScore}</span>
              </div>
              <div>
                <span className="text-gray-600">Score prom:</span>
                <span className="font-medium ml-1">{commission.averageScore}</span>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {commission.students.map((student) => (
                <div
                  key={student.id}
                  className="bg-gray-50 rounded p-3 text-sm"
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {student.name}
                  </div>
                  <div className="text-gray-600 mb-2">
                    Score: {student.score}
                    {student.is_recursante && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                        Recursante {student.recursante_catedra && `- ${student.recursante_catedra}`}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1 mb-2 border-t border-gray-200 pt-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <span className="font-medium">Morfo 1:</span> {getCatedraDisplay(student.morfo1_catedra, student.morfo1_otra)}
                      </div>
                      <div>
                        <span className="font-medium">Morfo 2:</span> {getCatedraDisplay(student.morfo2_catedra, student.morfo2_otra)}
                      </div>
                      <div>
                        <span className="font-medium">Tipo 1:</span> {getCatedraDisplay(student.tipo1_catedra, student.tipo1_otra)}
                      </div>
                      <div>
                        <span className="font-medium">Tipo 2:</span> {getCatedraDisplay(student.tipo2_catedra, student.tipo2_otra)}
                      </div>
                      <div>
                        <span className="font-medium">DG1:</span> {getCatedraDisplay(student.dg1_catedra, student.dg1_otra)}
                      </div>
                      <div>
                        <span className="font-medium">DG2:</span> {getCatedraDisplay(student.dg2_catedra, student.dg2_otra)}
                      </div>
                    </div>
                  </div>

                  <select
                    value={commission.id}
                    onChange={(e) => moveStudent(student.id, commission.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                  >
                    {commissions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id === commission.id ? 'Mover a...' : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="btn-primary"
        >
          Guardar distribución
        </button>

        <button
          onClick={handleExport}
          className="btn-secondary"
        >
          Exportar Excel
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface StudentsListProps {
  students: any[];
  password: string;
  onRefresh: () => void;
}

export default function StudentsList({ students, password, onRefresh }: StudentsListProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'multiple'>('multiple');
  const [singleDeleteId, setSingleDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase()) ||
    (student.personal_code && student.personal_code.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'name') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field: 'name' | 'score' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getCatedraDisplay = (catedra: string, otra: string | null) => {
    if (catedra === 'Otra' && otra) {
      return otra;
    }
    return catedra;
  };

  const getGenderDisplay = (gender: string, genderOther: string | null) => {
    if (gender === 'otro' && genderOther) {
      return genderOther;
    }
    const genderMap: { [key: string]: string } = {
      'masculino': 'M',
      'femenino': 'F',
      'no_binario': 'NB',
      'otro': 'Otro',
      'prefiero_no_decir': 'N/D'
    };
    return genderMap[gender] || gender;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(sortedStudents.map(s => s.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSingle = (id: number) => {
    setSingleDeleteId(id);
    setDeleteTarget('single');
    setShowConfirmDelete(true);
  };

  const handleDeleteMultiple = () => {
    setDeleteTarget('multiple');
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    const idsToDelete = deleteTarget === 'single' && singleDeleteId
      ? [singleDeleteId]
      : Array.from(selectedIds);

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/delete-students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentIds: idsToDelete })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar estudiantes');
      }

      const result = await response.json();
      alert(`${result.deletedCount} estudiante(s) eliminado(s) exitosamente`);

      setSelectedIds(new Set());
      setShowConfirmDelete(false);
      setSingleDeleteId(null);
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar estudiantes');
    } finally {
      setIsDeleting(false);
    }
  };

  const allSelected = sortedStudents.length > 0 && selectedIds.size === sortedStudents.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Lista de inscriptos ({students.length})
          </h2>

          {someSelected && (
            <button
              onClick={handleDeleteMultiple}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar seleccionados ({selectedIds.size})
            </button>
          )}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, código o mail..."
          className="input max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-3 py-3 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </th>
              <th
                className="px-3 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Código
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                DNI
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Género
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Mail
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Morfo 1
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Morfo 2
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Tipo 1
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Tipo 2
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                DG1
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                DG2
              </th>
              <th
                className="px-3 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('score')}
              >
                Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Recursante
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Cátedra recursando
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Comisión
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Grupo
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">
                Subgrupo
              </th>
              <th className="px-3 py-3 text-center font-medium text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(student.id)}
                    onChange={(e) => handleSelectOne(student.id, e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-3 py-3 text-gray-600 font-mono text-xs">
                  {student.personal_code || '-'}
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {student.dni}
                </td>
                <td className="px-3 py-3 text-gray-600 text-center">
                  {getGenderDisplay(student.gender, student.gender_other)}
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {student.email}
                </td>
                <td className="px-3 py-3 text-gray-600 text-xs">
                  {getCatedraDisplay(student.morfo1_catedra, student.morfo1_otra)}
                </td>
                <td className="px-3 py-3 text-gray-600 text-xs">
                  {getCatedraDisplay(student.morfo2_catedra, student.morfo2_otra)}
                </td>
                <td className="px-3 py-3 text-gray-600 text-xs">
                  {getCatedraDisplay(student.tipo1_catedra, student.tipo1_otra)}
                </td>
                <td className="px-3 py-3 text-gray-600 text-xs">
                  {getCatedraDisplay(student.tipo2_catedra, student.tipo2_otra)}
                </td>
                <td className="px-3 py-3 text-gray-600 text-xs">
                  {getCatedraDisplay(student.dg1_catedra, student.dg1_otra)}
                </td>
                <td className="px-3 py-3 text-gray-600 text-xs">
                  {getCatedraDisplay(student.dg2_catedra, student.dg2_otra)}
                </td>
                <td className="px-3 py-3 font-medium text-primary-700">
                  {student.score}
                </td>
                <td className="px-3 py-3">
                  {student.is_recursante ? (
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                      Sí
                    </span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="px-3 py-3 text-gray-600 text-xs">
                  {student.is_recursante && student.recursante_catedra
                    ? student.recursante_catedra
                    : '-'}
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {student.commission || '-'}
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {student.affinity_group_id || '-'}
                </td>
                <td className="px-3 py-3 text-gray-600">
                  {student.subgroup_id || '-'}
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => handleDeleteSingle(student.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-xs"
                    title="Eliminar estudiante"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron estudiantes
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              {deleteTarget === 'single'
                ? '¿Estás seguro que deseas eliminar este estudiante? Esta acción no se puede deshacer.'
                : `¿Estás seguro que deseas eliminar ${selectedIds.size} estudiante(s)? Esta acción no se puede deshacer.`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSingleDeleteId(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

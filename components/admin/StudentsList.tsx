'use client';

import { useState } from 'react';

interface StudentsListProps {
  students: any[];
}

export default function StudentsList({ students }: StudentsListProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Lista de inscriptos ({students.length})
        </h2>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o mail..."
          className="input max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th
                className="px-3 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 font-medium text-gray-900">
                  {student.name}
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
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface GroupFormationProps {
  creatorEmail: string;
  creatorName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Member {
  id: number;
  code: string;
  name: string;
  isCreator?: boolean;
}

export default function GroupFormation({ creatorEmail, creatorName, onSuccess, onCancel }: GroupFormationProps) {
  const [currentCode, setCurrentCode] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [subgroups, setSubgroups] = useState<Member[][]>([[]]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatorMember, setCreatorMember] = useState<Member | null>(null);

  // Auto-organize members into subgroups (max 3 per subgroup)
  const organizeIntoSubgroups = (allMembers: Member[]) => {
    const organized: Member[][] = [];
    let currentSubgroup: Member[] = [];

    allMembers.forEach((member, index) => {
      currentSubgroup.push(member);

      // If subgroup reaches 3, start a new one
      if (currentSubgroup.length === 3) {
        organized.push(currentSubgroup);
        currentSubgroup = [];
      }
    });

    // Add remaining members
    if (currentSubgroup.length > 0) {
      organized.push(currentSubgroup);
    }

    // Ensure at least one empty subgroup if we have room
    if (allMembers.length < 6 && organized.length === 0) {
      organized.push([]);
    }

    return organized;
  };

  // Initialize with creator
  useEffect(() => {
    const creator: Member = {
      id: 0,
      code: 'TU',
      name: creatorName || 'Vos (creador)',
      isCreator: true
    };
    setCreatorMember(creator);
    setMembers([creator]);
    setSubgroups([[creator]]);
  }, [creatorName]);

  const validateAndAddCode = async () => {
    if (!currentCode.trim()) return;

    setIsValidating(true);
    setErrors([]);

    try {
      const response = await fetch('/api/groups/validate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codes: [currentCode.toUpperCase()],
          creatorEmail
        })
      });

      const data = await response.json();

      if (data.valid && data.members[0].valid) {
        // Add new member
        const newMember: Member = {
          id: members.length,
          code: currentCode.toUpperCase(),
          name: data.members[0].name
        };

        const updatedMembers = [...members, newMember];
        setMembers(updatedMembers);

        // Auto-organize into subgroups
        const newSubgroups = organizeIntoSubgroups(updatedMembers);
        setSubgroups(newSubgroups);

        setCurrentCode('');
      } else {
        setErrors(data.errors || ['Código inválido']);
      }
    } catch (error) {
      setErrors(['Error al validar código']);
    } finally {
      setIsValidating(false);
    }
  };

  const removeMember = (memberId: number) => {
    const updatedMembers = members.filter(m => m.id !== memberId && !m.isCreator);
    setMembers(updatedMembers);
    const newSubgroups = organizeIntoSubgroups(updatedMembers);
    setSubgroups(newSubgroups);
  };

  const moveMember = (memberId: number, toSubgroupIndex: number) => {
    // Find current subgroup
    let fromSubgroupIndex = -1;
    let member: Member | null = null;

    for (let i = 0; i < subgroups.length; i++) {
      const found = subgroups[i].find(m => m.id === memberId);
      if (found) {
        fromSubgroupIndex = i;
        member = found;
        break;
      }
    }

    if (fromSubgroupIndex === -1 || !member) return;

    // Don't move if already in target subgroup
    if (fromSubgroupIndex === toSubgroupIndex) return;

    // Check if target subgroup would exceed 3
    if (subgroups[toSubgroupIndex].length >= 3) {
      setErrors(['Un subgrupo no puede tener más de 3 personas']);
      setTimeout(() => setErrors([]), 3000);
      return;
    }

    // Create new subgroups array
    const newSubgroups = subgroups.map(sg => [...sg]);

    // Remove from old subgroup
    newSubgroups[fromSubgroupIndex] = newSubgroups[fromSubgroupIndex].filter(m => m.id !== memberId);

    // Add to new subgroup
    newSubgroups[toSubgroupIndex].push(member);

    // Clean up empty subgroups (except if it's the last one)
    const cleaned = newSubgroups.filter((sg, idx) =>
      sg.length > 0 || idx === newSubgroups.length - 1
    );

    setSubgroups(cleaned);
  };

  const handleConfirm = async () => {
    // Validate subgroups
    const hasEmptySubgroup = subgroups.some(sg => sg.length === 0);
    if (hasEmptySubgroup && subgroups.length > 1) {
      setErrors(['No puede haber subgrupos vacíos']);
      return;
    }

    if (members.length < 2) {
      setErrors(['Necesitás al menos 2 personas para formar un grupo']);
      return;
    }

    setIsCreating(true);
    try {
      // Prepare member codes (excluding creator)
      const memberCodes = members.filter(m => !m.isCreator).map(m => m.code);

      // Prepare subgroup divisions (student IDs will be assigned by backend)
      // We send indices based on the members array order
      const divisions = subgroups.map(sg =>
        sg.map(m => m.id)
      );

      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorEmail,
          memberCodes,
          subgroupDivisions: divisions // Send the pre-organized divisions
        })
      });

      const data = await response.json();
      if (response.ok) {
        onSuccess();
      } else {
        setErrors([data.error]);
      }
    } catch (error) {
      setErrors(['Error al crear grupo']);
    } finally {
      setIsCreating(false);
    }
  };

  const canAddMore = members.length < 6;
  const totalMembers = members.length;

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Armar grupo de afinidad</h2>
      <p className="text-sm text-gray-600 mb-6">
        Agregá a tus compañeros de a uno. Se irán organizando automáticamente en subgrupos de hasta 3 personas.
        Podés reorganizarlos antes de confirmar.
      </p>

      {/* Add member input */}
      {canAddMore && (
        <div className="mb-6">
          <label className="label">Agregar compañero/a</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && validateAndAddCode()}
              placeholder="Código personal (ej: JUAN-1234)"
              className="input flex-1"
              maxLength={10}
              disabled={isValidating}
            />
            <button
              onClick={validateAndAddCode}
              disabled={!currentCode.trim() || isValidating}
              className="btn-primary"
            >
              {isValidating ? 'Validando...' : 'Agregar'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {totalMembers}/6 personas • {6 - totalMembers} lugares disponibles
          </p>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-700">{err}</p>
          ))}
        </div>
      )}

      {/* Subgroups visualization */}
      {members.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3">
            Organización en subgrupos {subgroups.length > 1 && `(${subgroups.length} subgrupos)`}
          </h3>

          <div className="space-y-4">
            {subgroups.map((subgroup, sgIndex) => (
              <div
                key={sgIndex}
                className="border-2 border-primary-200 rounded-lg p-4 bg-primary-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-primary-900">
                    Subgrupo {sgIndex + 1}
                  </h4>
                  <span className="text-sm text-primary-700">
                    {subgroup.length}/3 personas
                  </span>
                </div>

                {subgroup.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Vacío</p>
                ) : (
                  <div className="space-y-2">
                    {subgroup.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {member.name}
                              {member.isCreator && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                  Creador
                                </span>
                              )}
                            </p>
                            {!member.isCreator && (
                              <p className="text-xs text-gray-600">{member.code}</p>
                            )}
                          </div>
                        </div>

                        {!member.isCreator && (
                          <div className="flex gap-2">
                            {/* Move buttons */}
                            {subgroups.length > 1 && subgroups.map((_, targetIndex) => {
                              if (targetIndex === sgIndex) return null;
                              return (
                                <button
                                  key={targetIndex}
                                  onClick={() => moveMember(member.id, targetIndex)}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  title={`Mover a Subgrupo ${targetIndex + 1}`}
                                >
                                  → {targetIndex + 1}
                                </button>
                              );
                            })}

                            {/* Remove button */}
                            <button
                              onClick={() => removeMember(member.id)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalMembers > 3 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Los subgrupos se mantendrán juntos al distribuir en comisiones.
                {totalMembers <= 3 && ' Como son 3 o menos, formarán un solo subgrupo automáticamente.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={members.length < 2 || isCreating}
          className="btn-primary"
        >
          {isCreating ? 'Creando...' : `Confirmar grupo (${totalMembers} personas)`}
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </div>
  );
}

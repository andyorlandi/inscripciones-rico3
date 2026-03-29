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
  const [draggedMember, setDraggedMember] = useState<{ member: Member; fromSubgroup: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  // Initialize with creator
  useEffect(() => {
    const creator: Member = {
      id: 0,
      code: 'TU',
      name: creatorName || 'Vos (creador)',
      isCreator: true
    };
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

        // Add to first available subgroup (with space) or create new one
        const newSubgroups = [...subgroups];
        let added = false;

        // Try to add to existing subgroup with space
        for (let i = 0; i < newSubgroups.length; i++) {
          if (newSubgroups[i].length < 3) {
            newSubgroups[i] = [...newSubgroups[i], newMember];
            added = true;
            break;
          }
        }

        // If no space, create new subgroup if allowed
        if (!added) {
          if (newSubgroups.length < 2) {
            newSubgroups.push([newMember]);
            added = true;
          }
        }

        // Only update state if we successfully added to a subgroup
        if (added) {
          const updatedMembers = [...members, newMember];
          setMembers(updatedMembers);
          setSubgroups(newSubgroups);
          setCurrentCode('');
        } else {
          // This should not happen as we limit to 6 total members
          setErrors(['No hay espacio en los subgrupos existentes']);
        }
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
    // Remove from members list
    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updatedMembers);

    // Remove from subgroups
    const newSubgroups = subgroups.map(sg => sg.filter(m => m.id !== memberId));

    // Clean up empty subgroups (keep at least one)
    const cleaned = newSubgroups.filter(sg => sg.length > 0);
    if (cleaned.length === 0) {
      cleaned.push([]);
    }

    setSubgroups(cleaned);
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, member: Member, subgroupIndex: number) => {
    if (member.isCreator) {
      e.preventDefault();
      return;
    }
    setDraggedMember({ member, fromSubgroup: subgroupIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedMember(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, subgroupIndex: number) => {
    if (!draggedMember) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(subgroupIndex);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drop target if we're leaving to a non-child element
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node;

    if (!currentTarget.contains(relatedTarget)) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSubgroupIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedMember) return;

    const { member, fromSubgroup } = draggedMember;

    // Don't move if already in target subgroup
    if (fromSubgroup === targetSubgroupIndex) {
      setDraggedMember(null);
      setDropTarget(null);
      return;
    }

    // Check if target subgroup would exceed 3
    if (subgroups[targetSubgroupIndex].length >= 3) {
      setErrors(['Un subgrupo no puede tener más de 3 personas']);
      setTimeout(() => setErrors([]), 3000);
      setDraggedMember(null);
      setDropTarget(null);
      return;
    }

    // Perform the move
    moveMember(member.id, targetSubgroupIndex);

    setDraggedMember(null);
    setDropTarget(null);
  };

  // Add new subgroup
  const addNewSubgroup = () => {
    if (subgroups.length >= 2) {
      setErrors(['Solo podés tener hasta 2 subgrupos']);
      setTimeout(() => setErrors([]), 3000);
      return;
    }
    setSubgroups([...subgroups, []]);
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
        Agregá a tus compañeros ingresando sus códigos personales (máximo 5). Podés organizarlos en subgrupos
        de hasta 3 personas arrastrando los códigos entre subgrupos.
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">
              Organización en subgrupos {subgroups.length > 1 && `(${subgroups.length} subgrupos)`}
            </h3>
            {subgroups.length < 2 && totalMembers > 3 && (
              <button
                onClick={addNewSubgroup}
                className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                + Agregar subgrupo
              </button>
            )}
          </div>

          <p className="text-xs text-gray-600 mb-3">
            💡 Arrastrá los códigos entre subgrupos para reorganizar
          </p>

          <div className="space-y-4">
            {subgroups.map((subgroup, sgIndex) => (
              <div
                key={sgIndex}
                onDragOver={(e) => handleDragOver(e, sgIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, sgIndex)}
                className={`border-2 rounded-lg p-4 transition-all ${
                  dropTarget === sgIndex && draggedMember?.fromSubgroup !== sgIndex
                    ? 'border-green-400 bg-green-50 border-dashed scale-[1.02]'
                    : 'border-primary-200 bg-primary-50'
                }`}
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
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                    <p className="text-sm text-gray-500">
                      {dropTarget === sgIndex ? '⬇ Soltá aquí' : 'Arrastrá códigos aquí'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subgroup.map((member) => (
                      <div
                        key={member.id}
                        draggable={!member.isCreator}
                        onDragStart={(e) => handleDragStart(e, member, sgIndex)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-lg p-3 flex items-center justify-between transition-all ${
                          !member.isCreator ? 'cursor-move hover:shadow-md hover:scale-[1.02]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {!member.isCreator && (
                            <div className="text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                              </svg>
                            </div>
                          )}
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
                            {/* Remove button */}
                            <button
                              onClick={() => removeMember(member.id)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Eliminar"
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

          {totalMembers > 1 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Los subgrupos se mantendrán juntos al distribuir en comisiones.
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

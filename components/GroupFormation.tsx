'use client';

import { useState } from 'react';

interface GroupFormationProps {
  creatorEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GroupFormation({ creatorEmail, onSuccess, onCancel }: GroupFormationProps) {
  const [codes, setCodes] = useState(['']);
  const [validatedMembers, setValidatedMembers] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const addCodeInput = () => {
    if (codes.length < 5) {
      setCodes([...codes, '']);
    }
  };

  const updateCode = (index: number, value: string) => {
    const newCodes = [...codes];
    newCodes[index] = value.toUpperCase();
    setCodes(newCodes);
  };

  const validateCodes = async () => {
    const filledCodes = codes.filter(c => c.trim() !== '');
    if (filledCodes.length === 0) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/groups/validate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: filledCodes, creatorEmail })
      });

      const data = await response.json();
      setValidatedMembers(data.members || []);
      setErrors(data.errors || []);
    } catch (error) {
      setErrors(['Error al validar códigos']);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirm = async () => {
    const validCodes = validatedMembers.filter(m => m.valid).map(m => m.code);
    if (validCodes.length === 0) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorEmail, memberCodes: validCodes })
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

  const validCount = validatedMembers.filter(m => m.valid).length;

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Armar grupo de afinidad</h2>

      <p className="text-sm text-gray-600 mb-6">
        Ingresá los códigos personales de tus compañeros (máximo 5). Podés formar un grupo de hasta 6 personas.
      </p>

      <div className="space-y-3 mb-4">
        {codes.map((code, index) => (
          <div key={index}>
            <input
              type="text"
              value={code}
              onChange={(e) => updateCode(index, e.target.value)}
              onBlur={validateCodes}
              placeholder={`Código del compañero ${index + 1}`}
              className="input w-full"
              maxLength={10}
            />
            {validatedMembers[index] && (
              <p className={`text-sm mt-1 ${validatedMembers[index].valid ? 'text-green-600' : 'text-red-600'}`}>
                {validatedMembers[index].valid
                  ? `✓ ${validatedMembers[index].name}`
                  : `✗ ${errors[index] || 'Inválido'}`
                }
              </p>
            )}
          </div>
        ))}
      </div>

      {codes.length < 5 && (
        <button onClick={addCodeInput} className="btn-secondary mb-6">
          + Agregar otro compañero
        </button>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-700">{err}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={validCount === 0 || isCreating}
          className="btn-primary"
        >
          {isCreating ? 'Creando...' : `Confirmar grupo (${validCount + 1} personas)`}
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </div>
  );
}

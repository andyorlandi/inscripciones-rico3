'use client';

import { useState, FormEvent } from 'react';

interface StudentFormProps {
  onSuccess: (name: string, code: string) => void;
  onBack: () => void;
}

const CATEDRAS_DG = [
  'Belluccia',
  'Díaz Colodrero',
  'Diseño Transforma',
  'Ex Mazzeo',
  'Gabriele',
  'Melon',
  'Meygide',
  'Pujol',
  'Ex Rico',
  'Salomone',
  'Ex Wolkowicz',
  'Otra'
];

const CATEDRAS_MORFO = [
  'Brignone',
  'Longinotti',
  'Mazzeo',
  'Pereyra',
  'Pescio',
  'Wainhaus',
  'Otra'
];

const CATEDRAS_TIPO = [
  'Carbone',
  'Cosgaya',
  'Filippis',
  'Gaitto',
  'Longinotti',
  'Venancio',
  'Otra'
];

export default function StudentForm({ onSuccess, onBack }: StudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    gender: '',
    dg1_catedra: '',
    dg1_otra: '',
    dg2_catedra: '',
    dg2_otra: '',
    morfo1_catedra: '',
    morfo1_otra: '',
    morfo2_catedra: '',
    morfo2_otra: '',
    tipo1_catedra: '',
    tipo1_otra: '',
    tipo2_catedra: '',
    tipo2_otra: '',
    is_recursante: '',
    recursante_catedra: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      onSuccess(data.name, data.personal_code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Formulario de inscripción
        </h2>
        <p className="text-gray-600">
          Completá todos los campos a continuación
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre y Apellido */}
        <div>
          <label htmlFor="name" className="label">
            Nombre y Apellido *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input"
            placeholder="Ej: Luciana González"
          />
        </div>

        {/* Mail */}
        <div>
          <label htmlFor="email" className="label">
            Mail *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
            placeholder="tu.email@ejemplo.com"
          />
        </div>

        {/* DNI */}
        <div>
          <label htmlFor="dni" className="label">
            DNI *
          </label>
          <input
            type="text"
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
            pattern="[0-9]{7,8}"
            className="input"
            placeholder="Ej: 12345678"
            maxLength={8}
          />
          <p className="text-sm text-gray-500 mt-1">Solo números, sin puntos ni espacios</p>
        </div>

        {/* Género */}
        <div>
          <label htmlFor="gender" className="label">
            Género *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Seleccioná una opción</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro/No binario</option>
            <option value="prefiero_no_decir">Prefiero no decir</option>
          </select>
        </div>

        {/* Diseño Gráfico 1 */}
        <div>
          <label htmlFor="dg1_catedra" className="label">
            Diseño Gráfico 1 *
          </label>
          <select
            id="dg1_catedra"
            name="dg1_catedra"
            value={formData.dg1_catedra}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Seleccioná una cátedra</option>
            {CATEDRAS_DG.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {formData.dg1_catedra === 'Otra' && (
            <input
              type="text"
              name="dg1_otra"
              value={formData.dg1_otra}
              onChange={handleChange}
              required
              className="input mt-2"
              placeholder="Escribí el nombre de la cátedra"
            />
          )}
        </div>

        {/* Diseño Gráfico 2 */}
        <div>
          <label htmlFor="dg2_catedra" className="label">
            Diseño Gráfico 2 *
          </label>
          <select
            id="dg2_catedra"
            name="dg2_catedra"
            value={formData.dg2_catedra}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Seleccioná una cátedra</option>
            {CATEDRAS_DG.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {formData.dg2_catedra === 'Otra' && (
            <input
              type="text"
              name="dg2_otra"
              value={formData.dg2_otra}
              onChange={handleChange}
              required
              className="input mt-2"
              placeholder="Escribí el nombre de la cátedra"
            />
          )}
        </div>

        {/* Morfología 1 */}
        <div>
          <label htmlFor="morfo1_catedra" className="label">
            Morfología 1 *
          </label>
          <select
            id="morfo1_catedra"
            name="morfo1_catedra"
            value={formData.morfo1_catedra}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Seleccioná una cátedra</option>
            {CATEDRAS_MORFO.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {formData.morfo1_catedra === 'Otra' && (
            <input
              type="text"
              name="morfo1_otra"
              value={formData.morfo1_otra}
              onChange={handleChange}
              required
              className="input mt-2"
              placeholder="Escribí el nombre de la cátedra"
            />
          )}
        </div>

        {/* Morfología 2 */}
        <div>
          <label htmlFor="morfo2_catedra" className="label">
            Morfología 2 *
          </label>
          <select
            id="morfo2_catedra"
            name="morfo2_catedra"
            value={formData.morfo2_catedra}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Seleccioná una cátedra</option>
            {CATEDRAS_MORFO.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {formData.morfo2_catedra === 'Otra' && (
            <input
              type="text"
              name="morfo2_otra"
              value={formData.morfo2_otra}
              onChange={handleChange}
              required
              className="input mt-2"
              placeholder="Escribí el nombre de la cátedra"
            />
          )}
        </div>

        {/* Tipografía 1 */}
        <div>
          <label htmlFor="tipo1_catedra" className="label">
            Tipografía 1 *
          </label>
          <select
            id="tipo1_catedra"
            name="tipo1_catedra"
            value={formData.tipo1_catedra}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Seleccioná una cátedra</option>
            {CATEDRAS_TIPO.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {formData.tipo1_catedra === 'Otra' && (
            <input
              type="text"
              name="tipo1_otra"
              value={formData.tipo1_otra}
              onChange={handleChange}
              required
              className="input mt-2"
              placeholder="Escribí el nombre de la cátedra"
            />
          )}
        </div>

        {/* Tipografía 2 */}
        <div>
          <label htmlFor="tipo2_catedra" className="label">
            Tipografía 2 *
          </label>
          <select
            id="tipo2_catedra"
            name="tipo2_catedra"
            value={formData.tipo2_catedra}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Seleccioná una cátedra</option>
            {CATEDRAS_TIPO.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {formData.tipo2_catedra === 'Otra' && (
            <input
              type="text"
              name="tipo2_otra"
              value={formData.tipo2_otra}
              onChange={handleChange}
              required
              className="input mt-2"
              placeholder="Escribí el nombre de la cátedra"
            />
          )}
        </div>

        {/* ¿Recursante? */}
        <div>
          <label className="label">
            ¿Estás recursando DG3? *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center space-x-2 cursor-pointer p-4 rounded-2xl border-2 transition-all ${
              formData.is_recursante === 'si'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="is_recursante"
                value="si"
                checked={formData.is_recursante === 'si'}
                onChange={handleChange}
                required
                className="sr-only"
              />
              <span className="font-medium">Sí</span>
            </label>
            <label className={`flex items-center justify-center space-x-2 cursor-pointer p-4 rounded-2xl border-2 transition-all ${
              formData.is_recursante === 'no'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="is_recursante"
                value="no"
                checked={formData.is_recursante === 'no'}
                onChange={handleChange}
                required
                className="sr-only"
              />
              <span className="font-medium">No</span>
            </label>
          </div>
        </div>

        {/* Cátedra anterior (si es recursante) */}
        {formData.is_recursante === 'si' && (
          <div>
            <label htmlFor="recursante_catedra" className="label">
              ¿En qué cátedra cursaste DG3 antes? *
            </label>
            <input
              type="text"
              id="recursante_catedra"
              name="recursante_catedra"
              value={formData.recursante_catedra}
              onChange={handleChange}
              required
              className="input"
              placeholder="Ej: Rico, Wolkowicz, etc."
            />
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg shadow-lg shadow-primary-500/30 mt-8"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar inscripción →'
          )}
        </button>
      </form>
    </div>
  );
}

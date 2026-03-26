interface WelcomeProps {
  onStart: () => void;
  onCheckStatus: () => void;
}

export default function Welcome({ onStart, onCheckStatus }: WelcomeProps) {
  return (
    <div className="card text-center space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full">
          <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          DG3 Cátedra Rico
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
          Completá el formulario para inscribirte a las comisiones
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onStart}
          className="btn-primary w-full text-lg shadow-lg shadow-primary-500/30"
        >
          Comenzar inscripción
        </button>

        <button
          onClick={onCheckStatus}
          className="btn-secondary w-full"
        >
          Verificar mi estado
        </button>
      </div>
    </div>
  );
}

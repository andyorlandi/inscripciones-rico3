'use client';

import { useState } from 'react';
import Welcome from '@/components/Welcome';
import StudentForm from '@/components/StudentForm';
import Confirmation from '@/components/Confirmation';
import CheckStatus from '@/components/CheckStatus';

type Step = 'welcome' | 'form' | 'confirmation' | 'check-status';

export default function Home() {
  const [step, setStep] = useState<Step>('welcome');
  const [studentData, setStudentData] = useState<{ name: string; code: string } | null>(null);

  const handleStart = () => {
    setStep('form');
  };

  const handleFormSuccess = (name: string, code: string) => {
    setStudentData({ name, code });
    setStep('confirmation');
  };

  const handleCheckStatus = () => {
    setStep('check-status');
  };

  const handleBackToWelcome = () => {
    setStep('welcome');
    setStudentData(null);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {step === 'welcome' && (
          <Welcome onStart={handleStart} onCheckStatus={handleCheckStatus} />
        )}

        {step === 'form' && (
          <StudentForm onSuccess={handleFormSuccess} onBack={handleBackToWelcome} />
        )}

        {step === 'confirmation' && studentData && (
          <Confirmation
            name={studentData.name}
            code={studentData.code}
            onBack={handleBackToWelcome}
          />
        )}

        {step === 'check-status' && (
          <CheckStatus onBack={handleBackToWelcome} />
        )}
      </div>
    </main>
  );
}

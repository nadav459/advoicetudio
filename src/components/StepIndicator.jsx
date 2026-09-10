import React from 'react';

export default function StepIndicator({ currentStep, onStepClick }) {
  const steps = [
    { num: 1, label: 'תוכן גולמי' },
    { num: 2, label: 'ניסוח רדיו' },
    { num: 3, label: 'בחירת קריין' },
    { num: 4, label: 'השמעה והפצה' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-3 pb-1">
      {/* Official Apple HIG Segmented Control - 32px height */}
      <div className="ios-segmented-bar flex items-center justify-between">
        {steps.map((step) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => {
                if (step.num < currentStep && onStepClick) {
                  onStepClick(step.num);
                }
              }}
              disabled={step.num > currentStep}
              className={`flex-1 h-7 flex items-center justify-center transition-all duration-150 text-[13px] font-medium leading-none ${
                isActive
                  ? 'ios-segmented-thumb'
                  : isCompleted
                  ? 'text-[#007AFF] hover:opacity-80 cursor-pointer'
                  : 'text-[#8E8E93] cursor-not-allowed'
              }`}
            >
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

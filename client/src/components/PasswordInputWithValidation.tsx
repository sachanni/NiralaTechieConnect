import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { evaluatePassword } from '@/lib/passwordValidation';

interface PasswordInputWithValidationProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
}

export default function PasswordInputWithValidation({
  value,
  onChange,
  id = 'password',
  name = 'password',
  placeholder = 'Create a secure password',
  className = 'h-12',
}: PasswordInputWithValidationProps) {
  const [showRequirements, setShowRequirements] = useState(false);
  const validation = evaluatePassword(value);

  return (
    <div className="space-y-3">
      <Input
        id={id}
        name={name}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowRequirements(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="new-password"
        data-testid="input-password"
      />

      {(showRequirements || value.length > 0) && (
        <div
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          role="status"
          aria-live="polite"
          aria-label="Password requirements"
        >
          <p className="text-sm font-medium text-gray-700 mb-2">
            Password Requirements:
          </p>
          <ul className="space-y-2">
            {validation.requirements.map((req) => (
              <li
                key={req.id}
                className="flex items-center gap-2 text-sm transition-colors"
              >
                {req.met ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" aria-label="Requirement met" />
                ) : (
                  <X className="w-4 h-4 text-gray-400 flex-shrink-0" aria-label="Requirement not met" />
                )}
                <span className={req.met ? 'text-green-700 font-medium' : 'text-gray-600'}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
          {validation.isValid && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Strong password! ✓
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

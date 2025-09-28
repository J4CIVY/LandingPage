import React from 'react';
import { FieldError } from 'react-hook-form';

interface FormErrorProps {
  error: FieldError | undefined;
}

const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;
  return <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error.message}</p>;
};

export default FormError;

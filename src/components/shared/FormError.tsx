import React from 'react';
import { FieldError, Merge, FieldErrorsImpl } from 'react-hook-form';

type ErrorType = FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;

interface FormErrorProps {
  error: ErrorType;
}

const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  const message = (error as FieldError)?.message;

  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
};

export default FormError;

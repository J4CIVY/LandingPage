import { useLocation } from 'react-router-dom';
import RegistrationSuccess from './RegistrationSuccess';

const RegistrationSuccessWrapper = () => {
  const location = useLocation();
  const userEmail = location.state?.userEmail;

  if (!userEmail) {
    // Redirect or show an error if the email is not available
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>No se ha proporcionado la información de registro.</p>
      </div>
    );
  }

  return <RegistrationSuccess userEmail={userEmail} />;
};

export default RegistrationSuccessWrapper;

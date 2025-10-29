import RegistrationForm from '../RegistrationForm';

export default function RegistrationFormExample() {
  return (
    <RegistrationForm 
      phoneNumber="9876543210"
      onComplete={(data) => console.log('Registration completed:', data)}
    />
  );
}

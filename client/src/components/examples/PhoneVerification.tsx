import PhoneVerification from '../PhoneVerification';

export default function PhoneVerificationExample() {
  return (
    <PhoneVerification onVerified={(phone) => console.log('Verified:', phone)} />
  );
}

import LandingPage from '../LandingPage';

export default function LandingPageExample() {
  return (
    <LandingPage onGetStarted={() => console.log('Get started clicked')} />
  );
}

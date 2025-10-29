import Dashboard from '../Dashboard';

export default function DashboardExample() {
  const mockUser = {
    fullName: 'Rahul Sharma',
    company: 'Microsoft',
    flatNumber: 'A-1204',
    email: 'rahul@example.com',
    techStack: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python', 'Docker'],
    yearsOfExperience: 5,
    linkedinUrl: 'https://linkedin.com/in/rahulsharma',
    githubUrl: 'https://github.com/rahulsharma',
    profilePhotoUrl: '',
    points: 50,
    badges: ['React Ninja', 'First Member'],
  };

  return <Dashboard user={mockUser} />;
}

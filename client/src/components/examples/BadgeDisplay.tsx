import BadgeDisplay from '../BadgeDisplay';

export default function BadgeDisplayExample() {
  const badges = ['React Ninja', 'Python Pro', 'AWS Guru', 'First Member'];
  
  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Badges</h3>
        <BadgeDisplay badges={badges} size="lg" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Badges</h3>
        <BadgeDisplay badges={badges} size="sm" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">No Badges</h3>
        <BadgeDisplay badges={[]} />
      </div>
    </div>
  );
}

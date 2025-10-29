import { useState } from 'react';
import TechStackSelector from '../TechStackSelector';

export default function TechStackSelectorExample() {
  const [selected, setSelected] = useState<string[]>(['React', 'Node.js', 'AWS']);
  
  return (
    <div className="p-6 max-w-2xl">
      <TechStackSelector selected={selected} onChange={setSelected} />
    </div>
  );
}

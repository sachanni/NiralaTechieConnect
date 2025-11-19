import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search } from "lucide-react";

const TECH_STACKS = [
  { name: 'React', category: 'frontend' },
  { name: 'Angular', category: 'frontend' },
  { name: 'Vue.js', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'JavaScript', category: 'frontend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'Python', category: 'backend' },
  { name: 'Java', category: 'backend' },
  { name: 'Go', category: 'backend' },
  { name: 'Ruby', category: 'backend' },
  { name: 'PHP', category: 'backend' },
  { name: 'C#', category: 'backend' },
  { name: 'AWS', category: 'cloud' },
  { name: 'Azure', category: 'cloud' },
  { name: 'GCP', category: 'cloud' },
  { name: 'Docker', category: 'devops' },
  { name: 'Kubernetes', category: 'devops' },
  { name: 'MongoDB', category: 'database' },
  { name: 'PostgreSQL', category: 'database' },
  { name: 'MySQL', category: 'database' },
  { name: 'Redis', category: 'database' },
];

interface TechStackSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function TechStackSelector({ selected, onChange }: TechStackSelectorProps) {
  const [search, setSearch] = useState('');
  
  // Ensure selected is always an array (handle null/undefined)
  const safeSelected = selected || [];

  const filteredStacks = TECH_STACKS.filter(stack =>
    stack.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStack = (stackName: string) => {
    if (safeSelected.includes(stackName)) {
      onChange(safeSelected.filter(s => s !== stackName));
    } else {
      onChange([...safeSelected, stackName]);
    }
  };

  const removeStack = (stackName: string) => {
    onChange(safeSelected.filter(s => s !== stackName));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tech-search">Tech Stack</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="tech-search"
            type="text"
            placeholder="Search technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
            data-testid="input-tech-search"
          />
        </div>
      </div>

      {safeSelected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeSelected.map((stack) => (
            <Badge
              key={stack}
              variant="secondary"
              className="h-8 px-3 gap-1 hover-elevate"
              data-testid={`badge-selected-${stack}`}
            >
              <span className="font-mono text-xs">{stack}</span>
              <button
                onClick={() => removeStack(stack)}
                className="ml-1 hover:text-destructive"
                data-testid={`button-remove-${stack}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {filteredStacks.map((stack) => (
            <Badge
              key={stack.name}
              variant={safeSelected.includes(stack.name) ? "default" : "outline"}
              className="h-8 px-3 cursor-pointer hover-elevate active-elevate-2"
              onClick={() => toggleStack(stack.name)}
              data-testid={`badge-option-${stack.name}`}
            >
              <span className="font-mono text-xs">{stack.name}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

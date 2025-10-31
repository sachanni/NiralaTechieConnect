import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TECH_CATEGORIES_FOR_SKILLS } from "@/lib/techStack";

interface SkillsMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  disabledSkills?: string[];
}

export default function SkillsMultiSelect({
  value,
  onChange,
  label,
  disabledSkills = [],
}: SkillsMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (skill: string) => {
    if (disabledSkills.includes(skill)) {
      return;
    }
    if (value.includes(skill)) {
      onChange(value.filter((s) => s !== skill));
    } else {
      onChange([...value, skill]);
    }
  };

  const handleRemove = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[40px] py-2"
          >
            <span className="text-muted-foreground">
              {value.length === 0
                ? "Select skills..."
                : `${value.length} skill${value.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search skills..." />
            <CommandEmpty>No skill found.</CommandEmpty>
            <div className="max-h-[400px] overflow-auto">
              {Object.entries(TECH_CATEGORIES_FOR_SKILLS).map(([category, skills]) => (
                <CommandGroup key={category} heading={category}>
                  {skills.map((skill) => {
                    const isDisabled = disabledSkills.includes(skill);
                    return (
                      <CommandItem
                        key={skill}
                        value={skill}
                        onSelect={() => handleSelect(skill)}
                        disabled={isDisabled}
                        className={cn(isDisabled && "opacity-50 cursor-not-allowed")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value.includes(skill) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {skill}
                        {isDisabled && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            (in other section)
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="h-7 px-2 gap-1"
            >
              <span className="font-mono text-xs">{skill}</span>
              <button
                onClick={() => handleRemove(skill)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

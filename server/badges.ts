export type ExperienceBadge = 'Junior' | 'Mid-Level' | 'Senior' | 'Expert' | 'Veteran';

export interface BadgeInfo {
  badge: ExperienceBadge;
  color: string;
  icon: string;
}

export function getExperienceBadge(yearsOfExperience: number): BadgeInfo {
  if (yearsOfExperience >= 20) {
    return {
      badge: 'Veteran',
      color: '#9333EA',
      icon: '👑'
    };
  } else if (yearsOfExperience >= 15) {
    return {
      badge: 'Expert',
      color: '#DC2626',
      icon: '⭐'
    };
  } else if (yearsOfExperience >= 10) {
    return {
      badge: 'Senior',
      color: '#EA580C',
      icon: '🎯'
    };
  } else if (yearsOfExperience >= 5) {
    return {
      badge: 'Mid-Level',
      color: '#2563EB',
      icon: '📈'
    };
  } else {
    return {
      badge: 'Junior',
      color: '#16A34A',
      icon: '🌱'
    };
  }
}

export function isExpert(yearsOfExperience: number): boolean {
  return yearsOfExperience >= 15;
}

export function isSeniorOrAbove(yearsOfExperience: number): boolean {
  return yearsOfExperience >= 10;
}

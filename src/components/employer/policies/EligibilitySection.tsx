/**
 * Eligibility Section Component
 * 
 * Configure who is eligible for this policy.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Building2, MapPin, Clock, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  EligibilityRules, 
  MOCK_GRADES, 
  MOCK_DEPARTMENTS, 
  MOCK_LOCATIONS,
  MOCK_CONTRACT_TYPES,
} from './types';

interface EligibilitySectionProps {
  eligibility: EligibilityRules;
  onChange: (eligibility: EligibilityRules) => void;
}

export function EligibilitySection({ eligibility, onChange }: EligibilitySectionProps) {
  const toggleGrade = (grade: string) => {
    const newGrades = eligibility.grades.includes(grade)
      ? eligibility.grades.filter((g) => g !== grade)
      : [...eligibility.grades, grade];
    onChange({ ...eligibility, grades: newGrades });
  };

  const toggleDepartment = (dept: string) => {
    const newDepts = eligibility.departments.includes(dept)
      ? eligibility.departments.filter((d) => d !== dept)
      : [...eligibility.departments, dept];
    onChange({ ...eligibility, departments: newDepts });
  };

  const toggleLocation = (loc: string) => {
    const newLocs = eligibility.locations.includes(loc)
      ? eligibility.locations.filter((l) => l !== loc)
      : [...eligibility.locations, loc];
    onChange({ ...eligibility, locations: newLocs });
  };

  const toggleContractType = (type: string) => {
    const newTypes = eligibility.contractTypes.includes(type)
      ? eligibility.contractTypes.filter((t) => t !== type)
      : [...eligibility.contractTypes, type];
    onChange({ ...eligibility, contractTypes: newTypes });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Eligibility Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grades */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Grades
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select which grades are eligible. Leave empty for all grades.
          </p>
          <div className="flex flex-wrap gap-2">
            {MOCK_GRADES.map((grade) => (
              <Badge
                key={grade}
                variant={eligibility.grades.includes(grade) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleGrade(grade)}
              >
                {grade}
              </Badge>
            ))}
          </div>
          {eligibility.grades.length === 0 && (
            <p className="text-xs text-emerald-600">All grades eligible</p>
          )}
        </div>

        {/* Departments */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Departments
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select which departments are eligible. Leave empty for all departments.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {MOCK_DEPARTMENTS.map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox
                  id={`dept-${dept}`}
                  checked={eligibility.departments.includes(dept)}
                  onCheckedChange={() => toggleDepartment(dept)}
                />
                <label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
                  {dept}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Locations
          </Label>
          <div className="flex flex-wrap gap-2">
            {MOCK_LOCATIONS.map((loc) => (
              <Badge
                key={loc}
                variant={eligibility.locations.includes(loc) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleLocation(loc)}
              >
                {loc}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tenure & Probation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Minimum Tenure (months)
            </Label>
            <Input
              type="number"
              min={0}
              value={eligibility.minTenureMonths}
              onChange={(e) =>
                onChange({ ...eligibility, minTenureMonths: parseInt(e.target.value) || 0 })
              }
              className="w-32"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FileCheck className="w-4 h-4 text-muted-foreground" />
              Probation Requirement
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={eligibility.probationPassed}
                onCheckedChange={(checked) =>
                  onChange({ ...eligibility, probationPassed: checked })
                }
              />
              <span className="text-sm">
                {eligibility.probationPassed ? 'Must pass probation' : 'No probation requirement'}
              </span>
            </div>
          </div>
        </div>

        {/* Contract Types */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Contract Types</Label>
          <div className="flex flex-wrap gap-2">
            {MOCK_CONTRACT_TYPES.map((type) => (
              <Badge
                key={type}
                variant={eligibility.contractTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => toggleContractType(type)}
              >
                {type.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

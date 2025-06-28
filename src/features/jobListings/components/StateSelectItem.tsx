import { SelectItem } from '@/components/ui/select';
import states from '@/data/states.json';

export default function StateSelectItem() {
  return Object.entries(states).map(([abbreviation, name]) => (
    <SelectItem key={abbreviation} value={abbreviation}>
      {name}
    </SelectItem>
  ));
}

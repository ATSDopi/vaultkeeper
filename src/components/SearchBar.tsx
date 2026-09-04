import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
      <input
        type="text"
        className="input-field pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search entries..."
      />
    </div>
  );
}


import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  from: string;
  to: string;
  setFrom: (date: string) => void;
  setTo: (date: string) => void;
}

const DateRangeFilter = ({ from, to, setFrom, setTo }: DateRangeFilterProps) => {
  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm mr-1">From:</label>
      <Input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="text-sm"
      />
      <label className="text-sm mr-1">To:</label>
      <Input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="text-sm"
      />
    </div>
  );
};

export default DateRangeFilter;

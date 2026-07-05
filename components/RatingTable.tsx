import { RatingItem, SCALE_OPTIONS, ScaleValue } from "@/lib/questions";

export default function RatingTable({
  items,
  values,
  onChange,
}: {
  items: RatingItem[];
  values: Record<string, ScaleValue | undefined>;
  onChange: (itemId: string, value: ScaleValue) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-right p-2 border-b border-gray-200"></th>
            {SCALE_OPTIONS.map((opt) => (
              <th key={opt.value} className="p-2 border-b border-gray-200 font-normal text-xs text-gray-600 text-center min-w-[70px]">
                {opt.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="p-2 text-right">{item.label}</td>
              {SCALE_OPTIONS.map((opt) => (
                <td key={opt.value} className="text-center">
                  <input
                    type="radio"
                    name={item.id}
                    required
                    checked={values[item.id] === opt.value}
                    onChange={() => onChange(item.id, opt.value)}
                    className="w-4 h-4 cursor-pointer accent-brand-primary"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

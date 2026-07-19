import { RatingItem, SCALE_OPTIONS, ScaleValue } from "@/lib/questions";

export default function RatingTable({
  items,
  values,
  onChange,
  scaleOptions = SCALE_OPTIONS,
  ltr = false,
}: {
  items: RatingItem[];
  values: Record<string, ScaleValue | undefined>;
  onChange: (itemId: string, value: ScaleValue) => void;
  scaleOptions?: { value: ScaleValue; label: string }[];
  ltr?: boolean;
}) {
  const labelAlign = ltr ? "text-left" : "text-right";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className={`${labelAlign} p-2 border-b border-gray-200`}></th>
            {scaleOptions.map((opt) => (
              <th key={opt.value} className="p-2 border-b border-gray-200 font-normal text-xs text-gray-600 text-center min-w-[70px]">
                {opt.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className={`p-2 ${labelAlign}`}>{item.label}</td>
              {scaleOptions.map((opt) => (
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

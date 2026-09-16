import { StarIcon } from "@/components/icons";

export function StarRating({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon
            key={index}
            className={`size-3.5 ${index < Math.round(value) ? "opacity-100" : "opacity-25"}`}
          />
        ))}
      </div>
      <span className={`font-medium text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

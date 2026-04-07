"use client";

export default function ChartGrid({
  layout,
  children,
}: {
  layout: number;
  children: React.ReactNode[];
}) {
  const gridClass =
    layout === 1
      ? "grid-cols-1"
      : layout === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className={`grid ${gridClass} gap-4 w-full`}>
      {children}
    </div>
  );
}

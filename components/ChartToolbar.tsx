"use client";

export default function ChartToolbar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg mb-4">
      <div className="flex flex-wrap gap-3 items-center">
        {children}
      </div>
    </div>
  );
}

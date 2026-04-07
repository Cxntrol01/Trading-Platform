"use client";

export default function ChartWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-[400px] bg-black rounded-lg border border-gray-800 p-2">
      {children}
    </div>
  );
}

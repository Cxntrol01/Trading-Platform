"use client";

export default function FullscreenChart({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <button className="px-3 py-1 bg-yellow-600 rounded mb-2">
        Fullscreen
      </button>

      <div className="w-full">{children}</div>
    </div>
  );
}

import React from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  note: string;
  noteColor?: string;
}

export function KpiCard({
  label,
  value,
  note,
  noteColor = '#5B5A72',
}: KpiCardProps) {
  return (
    <div className="bg-white border border-line rounded-[16px] p-5 flex flex-col gap-2 shadow-sm">
      <span className="text-[14px] text-muted">{label}</span>
      <strong className="text-[32px] font-extrabold text-navy-deep leading-none">
        {value}
      </strong>
      <span
        style={{ color: noteColor }}
        className="text-[13px] font-semibold mt-1"
      >
        {note}
      </span>
    </div>
  );
}


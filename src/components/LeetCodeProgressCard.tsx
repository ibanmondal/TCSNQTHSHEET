import React from 'react';
import { Check } from 'lucide-react';

interface LeetCodeProgressCardProps {
  total: number;
  completed: number;
  easyTotal: number;
  easyCompleted: number;
  mediumTotal: number;
  mediumCompleted: number;
  hardTotal: number;
  hardCompleted: number;
  attemptingCount: number;
}

export const LeetCodeProgressCard: React.FC<LeetCodeProgressCardProps> = ({
  total,
  completed,
  easyTotal,
  easyCompleted,
  mediumTotal,
  mediumCompleted,
  hardTotal,
  hardCompleted,
  attemptingCount
}) => {
  // SVG circular gauge calculations
  // Radius and circumference
  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.59

  // Calculate fractions of the circle
  // We allocate parts of the circle proportional to each difficulty or to solved counts
  const easyRatio = total > 0 ? easyCompleted / total : 0;
  const mediumRatio = total > 0 ? mediumCompleted / total : 0;
  const hardRatio = total > 0 ? hardCompleted / total : 0;

  const easyStrokeLength = easyRatio * circumference;
  const mediumStrokeLength = mediumRatio * circumference;
  const hardStrokeLength = hardRatio * circumference;

  const easyOffset = 0;
  const mediumOffset = -easyStrokeLength;
  const hardOffset = -(easyStrokeLength + mediumStrokeLength);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-foreground tracking-tight">Difficulty Breakdown</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">LeetCode Style</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-2">
        {/* Left Circular Gauge */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background Track Circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-muted/40 stroke-current"
                strokeWidth="6.5"
                fill="transparent"
              />

              {/* Easy Arc */}
              {easyStrokeLength > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#00b8a3"
                  strokeWidth="6.5"
                  fill="transparent"
                  strokeDasharray={`${easyStrokeLength} ${circumference - easyStrokeLength}`}
                  strokeDashoffset={easyOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Medium Arc */}
              {mediumStrokeLength > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#ffc01e"
                  strokeWidth="6.5"
                  fill="transparent"
                  strokeDasharray={`${mediumStrokeLength} ${circumference - mediumStrokeLength}`}
                  strokeDashoffset={mediumOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Hard Arc */}
              {hardStrokeLength > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#ef4743"
                  strokeWidth="6.5"
                  fill="transparent"
                  strokeDasharray={`${hardStrokeLength} ${circumference - hardStrokeLength}`}
                  strokeDashoffset={hardOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>

            {/* Gauge Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <div className="flex items-baseline justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{completed}</span>
                <span className="text-xs font-semibold text-muted-foreground ml-0.5">/{total}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 mt-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
                <span>Solved</span>
              </div>
            </div>
          </div>

          <div className="text-xs font-medium text-muted-foreground mt-1">
            {attemptingCount} Attempting
          </div>
        </div>

        {/* Right Difficulty Stat Cards */}
        <div className="flex flex-col gap-2.5 w-full sm:w-48">
          {/* Easy Card */}
          <div className="rounded-lg bg-muted/40 hover:bg-muted/60 border border-border/50 p-2.5 transition-colors">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#00b8a3]">Easy</span>
              <span className="font-bold text-foreground font-mono">{easyCompleted}/{easyTotal}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-[#00b8a3] transition-all duration-500"
                style={{ width: `${easyTotal > 0 ? (easyCompleted / easyTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Medium Card */}
          <div className="rounded-lg bg-muted/40 hover:bg-muted/60 border border-border/50 p-2.5 transition-colors">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#ffc01e]">Med.</span>
              <span className="font-bold text-foreground font-mono">{mediumCompleted}/{mediumTotal}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-[#ffc01e] transition-all duration-500"
                style={{ width: `${mediumTotal > 0 ? (mediumCompleted / mediumTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Hard Card */}
          <div className="rounded-lg bg-muted/40 hover:bg-muted/60 border border-border/50 p-2.5 transition-colors">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#ef4743]">Hard</span>
              <span className="font-bold text-foreground font-mono">{hardCompleted}/{hardTotal}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-[#ef4743] transition-all duration-500"
                style={{ width: `${hardTotal > 0 ? (hardCompleted / hardTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

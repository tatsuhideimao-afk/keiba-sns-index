// 支持率推移の折れ線グラフ（依存を増やさず素のSVGで描画）。SPEC Phase 5。
type Series = {
  name: string;
  color: string;
  points: { date: string; value: number }[]; // value は 0..1（支持率）
};

export default function TrendChart({
  dates,
  series,
}: {
  dates: string[];
  series: Series[];
}) {
  const W = 640;
  const H = 260;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 34;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const n = dates.length;
  const x = (i: number) => (n <= 1 ? padL + innerW / 2 : padL + (innerW * i) / (n - 1));
  const y = (v: number) => padT + innerH * (1 - Math.max(0, Math.min(1, v)));

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="trend-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="支持率推移"
        style={{ maxWidth: "100%" }}
      >
        {/* y グリッド */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={padL - 6} y={y(t) + 4} fontSize={10} fill="var(--muted)" textAnchor="end">
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}
        {/* x ラベル（日付） */}
        {dates.map((d, i) => (
          <text
            key={d}
            x={x(i)}
            y={H - padB + 16}
            fontSize={10}
            fill="var(--muted)"
            textAnchor="middle"
          >
            {d.slice(5)}
          </text>
        ))}
        {/* 各馬の折れ線 */}
        {series.map((s) => {
          const path = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`)
            .join(" ");
          return (
            <g key={s.name}>
              <path d={path} fill="none" stroke={s.color} strokeWidth={2} />
              {s.points.map((p, i) => (
                <circle key={i} cx={x(i)} cy={y(p.value)} r={2.5} fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="legend">
        {series.map((s) => (
          <span className="item" key={s.name}>
            <span className="swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// 1つのランキングパネル（支持率 / 本命率 / 穴 / SNS指数）。SPEC Phase 5。
type Row = {
  umaban: number | null;
  name: string;
  value: number;
  display: string;
};

export default function RankPanel({
  title,
  sub,
  rows,
  max,
  barColor = "var(--accent)",
}: {
  title: string;
  sub?: string;
  rows: Row[];
  max: number;
  barColor?: string;
}) {
  const top = rows.slice(0, 8);
  return (
    <div className="panel">
      <h3>
        {title}
        {sub ? <span className="sub">{sub}</span> : null}
      </h3>
      {top.length === 0 ? (
        <div className="empty" style={{ border: "none", padding: "12px 0" }}>
          データなし
        </div>
      ) : (
        top.map((r, i) => (
          <div className="rank-row" key={`${r.name}-${i}`}>
            <span className="pos">{i + 1}</span>
            <span className="uma">{r.umaban ?? "-"}</span>
            <span className="nm">
              {r.name}
              <span
                className="bar"
                style={{
                  width: `${max > 0 ? Math.max(2, (r.value / max) * 100) : 0}%`,
                  background: barColor,
                }}
              />
            </span>
            <span className="val">{r.display}</span>
          </div>
        ))
      )}
    </div>
  );
}

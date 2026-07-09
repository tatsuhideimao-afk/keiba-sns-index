import Link from "next/link";
import { supabase, type Horse, type Race, type Snapshot } from "@/lib/supabase";
import RankPanel from "@/components/RankPanel";
import TrendChart from "@/components/TrendChart";

export const dynamicParams = false;

// 静的エクスポート用: 全レースの詳細ページを生成
export async function generateStaticParams() {
  const { data } = await supabase.from("races").select("race_key");
  return (data ?? []).map((r) => ({ raceKey: r.race_key }));
}

const TREND_COLORS = [
  "#ff5d5d", "#4ea1ff", "#ffb020", "#4ade80", "#c084fc", "#f472b6",
];

export default async function RacePage({
  params,
}: {
  params: Promise<{ raceKey: string }>;
}) {
  const { raceKey } = await params;

  const { data: race } = await supabase
    .from("races")
    .select("id,race_key,name,race_date,racecourse,race_no")
    .eq("race_key", raceKey)
    .maybeSingle();

  if (!race) {
    return (
      <>
        <p className="breadcrumb">
          <Link href="/">← 一覧</Link>
        </p>
        <p className="empty">レースが見つかりません。</p>
      </>
    );
  }
  const r = race as Race;

  const [{ data: horsesData }, { data: snapsData }, { data: videoData }] =
    await Promise.all([
      supabase.from("horses").select("id,race_id,umaban,name").eq("race_id", r.id),
      supabase
        .from("snapshots")
        .select("*")
        .eq("race_id", r.id)
        .order("as_of", { ascending: true }),
      supabase
        .from("race_videos")
        .select("race_key,url,title,kind")
        .eq("race_key", raceKey)
        .maybeSingle(),
    ]);
  const video = videoData as { url: string; title: string | null; kind: string | null } | null;

  const horses = (horsesData ?? []) as Horse[];
  const snaps = (snapsData ?? []) as Snapshot[];
  const horseById = new Map(horses.map((h) => [h.id, h]));

  // 最新 as_of の snapshot で 4ランキング
  const dates = Array.from(new Set(snaps.map((s) => s.as_of))).sort();
  const latest = dates[dates.length - 1];
  const latestSnaps = snaps.filter((s) => s.as_of === latest);

  const nameOf = (hid: number) => horseById.get(hid)?.name ?? `#${hid}`;
  const umaOf = (hid: number) => horseById.get(hid)?.umaban ?? null;

  const rankBy = (
    key: (s: Snapshot) => number,
    fmt: (s: Snapshot) => string,
  ) =>
    latestSnaps
      .map((s) => ({
        umaban: umaOf(s.horse_id),
        name: nameOf(s.horse_id),
        value: key(s),
        display: fmt(s),
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value);

  const supportRows = rankBy(
    (s) => s.support_rate,
    (s) => `${Math.round(s.support_rate * 100)}%`,
  );
  const honmeiRows = rankBy(
    (s) => s.honmei_rate,
    (s) => `${Math.round(s.honmei_rate * 100)}%`,
  );
  const anaRows = rankBy(
    (s) => s.ana_count,
    (s) => `${s.ana_count}`,
  );
  const indexRows = rankBy(
    (s) => s.sns_index,
    (s) => `${s.sns_index}`,
  );

  // 推移: SNS指数上位6頭の支持率を日次で
  const topHorseIds = indexRows.length
    ? latestSnaps
        .slice()
        .sort((a, b) => b.sns_index - a.sns_index)
        .slice(0, 6)
        .map((s) => s.horse_id)
    : [];
  const trendSeries = topHorseIds.map((hid, i) => ({
    name: nameOf(hid),
    color: TREND_COLORS[i % TREND_COLORS.length],
    points: dates.map((d) => {
      const s = snaps.find((x) => x.horse_id === hid && x.as_of === d);
      return { date: d, value: s ? s.support_rate : 0 };
    }),
  }));

  const hasData = latestSnaps.some(
    (s) => s.support_rate > 0 || s.sns_index > 0 || s.ana_count > 0,
  );
  const totalPosts = latestSnaps[0]?.total_posts ?? 0;

  return (
    <>
      <p className="breadcrumb">
        <Link href="/">← 一覧</Link>
      </p>
      <h2 className="race-title">{r.name}</h2>
      <p className="race-sub">
        {r.race_date}
        {r.racecourse ? ` ・ ${r.racecourse}` : ""}
        {r.race_no ? ` ${r.race_no}R` : ""}
        {latest ? ` ・ 集計日 ${latest} ・ 対象投稿 ${totalPosts}件` : ""}
      </p>

      {video ? (
        <div className="videowrap">
          {video.kind === "youtube" ? (
            <iframe
              src={video.url}
              title={video.title ?? `${r.name} SNS集合知`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={video.url} controls playsInline preload="metadata" />
          )}
        </div>
      ) : null}

      {!hasData ? (
        <p className="empty">
          このレースの集計データはまだありません（収集が走ると支持率・SNS指数が表示されます）。
        </p>
      ) : (
        <>
          <div className="grid">
            <RankPanel
              title="SNS指数"
              sub="0-100"
              rows={indexRows}
              max={100}
              barColor="var(--accent)"
            />
            <RankPanel
              title="支持率"
              sub="印を付けた投稿の割合"
              rows={supportRows}
              max={1}
              barColor="#4ade80"
            />
            <RankPanel
              title="本命率"
              sub="◎の割合"
              rows={honmeiRows}
              max={1}
              barColor="var(--honmei)"
            />
            <RankPanel
              title="穴人気"
              sub="▲△☆の数"
              rows={anaRows}
              max={anaRows[0]?.value ?? 1}
              barColor="var(--ana)"
            />
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <h3>
              支持率の推移<span className="sub">SNS指数 上位6頭</span>
            </h3>
            {dates.length <= 1 ? (
              <p className="empty" style={{ border: "none" }}>
                推移は集計が2日分以上たまると表示されます（現在 {dates.length} 日分）。
              </p>
            ) : (
              <TrendChart dates={dates} series={trendSeries} />
            )}
          </div>
        </>
      )}

      <p className="footnote">
        SNS集合知（公開予想の集約）であり、AI予想ではありません。生の個別予想は非公開で、
        公開しているのは集計結果のみです。
      </p>
    </>
  );
}

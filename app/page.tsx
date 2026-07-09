import Link from "next/link";
import { supabase, type Race } from "@/lib/supabase";

export default async function Home() {
  const { data: races, error } = await supabase
    .from("races")
    .select("id,race_key,name,race_date,racecourse,race_no")
    .order("race_date", { ascending: false });

  if (error) {
    return <p className="empty">レースの取得に失敗しました: {error.message}</p>;
  }
  const list = (races ?? []) as Race[];

  return (
    <>
      <p className="breadcrumb">重賞レース一覧</p>
      {list.length === 0 ? (
        <p className="empty">まだレースがありません。収集が走ると表示されます。</p>
      ) : (
        list.map((r) => (
          <Link key={r.id} href={`/race/${r.race_key}`} className="race-card">
            <div className="name">{r.name}</div>
            <div className="meta">
              {r.race_date}
              {r.racecourse ? ` ・ ${r.racecourse}` : ""}
              {r.race_no ? ` ${r.race_no}R` : ""}
            </div>
          </Link>
        ))
      )}
      <p className="footnote">
        本サイトは公開された予想（YouTube等）を集約した「SNS集合知」であり、AIによる予想では
        ありません。出典は各投稿に帰属します。投資助言・賭博の勧誘を目的とするものではありません。
      </p>
    </>
  );
}

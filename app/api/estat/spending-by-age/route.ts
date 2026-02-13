// app/api/estat/spending-by-age/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const ESTAT_ENDPOINT =
  "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData";
const STATS_DATA_ID = "0002070010";

/**
 * e-Stat getStatsData JSON の最小限だけ扱うためのゆるい型
 * （e-Statの戻りはかなりネストが深いので、必要部分だけ）
 */
type EstatResponse = {
  GET_STATS_DATA?: {
    RESULT?: { STATUS?: string; ERROR_MSG?: string };
    STATISTICAL_DATA?: {
      CLASS_INF?: {
        CLASS_OBJ?: Array<{
          "@id"?: string;
          "@name"?: string;
          CLASS?: Array<{ "@code"?: string; "@name"?: string }>;
        }>;
      };
      DATA_INF?: {
        VALUE?: Array<
          {
            $?: string; // 値(文字列)
            "@unit"?: string;

            // ディメンション（表によって存在するキーが変わる）
            "@area"?: string;
            "@time"?: string;
            "@cat01"?: string;
            "@cat02"?: string;
            "@cat03"?: string;
            "@cat04"?: string;
          } & Record<string, string | undefined>
        >;
      };
    };
  };
};

type EstatClass = { "@code"?: string; "@name"?: string };
type EstatClassObj = { CLASS?: EstatClass[] };
type EstatValueRow = { $?: string; "@unit"?: string } & Record<
  string,
  string | undefined
>;

function toArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function normalize(str: string) {
  return str.replace(/\s+/g, "").trim();
}

const CATEGORY_KEYS = [
  "food",
  "utilities",
  "dailyGoods",
  "rent",
  "transport",
  "subscription",
  "entertainment",
  "medicalInsurance",
] as const;

type CategoryKey = (typeof CATEGORY_KEYS)[number];

const ITEM_NAME_TO_CATEGORY: Array<{
  key: CategoryKey;
  keywords: string[];
}> = [
  { key: "food", keywords: ["食料", "食費", "外食"] },
  { key: "utilities", keywords: ["光熱", "水道", "電気", "ガス"] },
  { key: "dailyGoods", keywords: ["日用品", "家庭用品", "家具", "家事用品"] },
  { key: "rent", keywords: ["家賃", "住居", "住居費"] },
  { key: "transport", keywords: ["交通", "運輸"] },
  { key: "subscription", keywords: ["通信", "サブスク", "定額"] },
  { key: "entertainment", keywords: ["教養娯楽", "娯楽", "趣味", "交際"] },
  { key: "medicalInsurance", keywords: ["医療", "保健", "保険"] },
];

const mapItemNameToCategory = (name: string): CategoryKey | null => {
  const normalized = normalize(name);
  for (const rule of ITEM_NAME_TO_CATEGORY) {
    if (rule.keywords.some((kw) => normalized.includes(normalize(kw)))) {
      return rule.key;
    }
  }
  return null;
};

/**
 * CLASS_OBJ から、名前にキーワードが含まれるディメンションを探す
 */
function findClassObj(
  classObjs: Array<{ "@id"?: string; "@name"?: string }>,
  keywords: string[],
) {
  const kw = keywords.map(normalize);
  return classObjs.find((o) => {
    const name = normalize(o["@name"] ?? "");
    return kw.some((k) => name.includes(k));
  });
}

/**
 * CLASS_OBJ の中から、名前にキーワードが含まれる CLASS（コード）を探す
 */
function findClassCode(
  classObj:
    | { CLASS?: Array<{ "@code"?: string; "@name"?: string }> }
    | undefined,
  keywords: string[],
): string | null {
  if (!classObj) return null;
  const kw = keywords.map(normalize);
  const classes = toArray(classObj.CLASS);
  const hit = classes.find((c) => {
    const name = normalize(c["@name"] ?? "");
    return kw.some((k) => name.includes(k));
  });
  return hit?.["@code"] ?? null;
}

/**
 * TIMEっぽいコード一覧を拾って「最新」を決める（コードが YYYYMM 形式である想定）
 */
function pickLatestTimeCode(timeObj: EstatClassObj | undefined): string | null {
  const classes = toArray(timeObj?.CLASS);
  const codes = classes
    .map((c) => c?.["@code"])
    .filter((x): x is string => typeof x === "string");

  // "202312" のような数字6桁だけを優先
  const yyyymm = codes
    .map((c) => c.match(/^\d{6}$/)?.[0])
    .filter(Boolean) as string[];

  if (yyyymm.length > 0) return yyyymm.sort().at(-1) ?? null;

  // ダメなら単純に文字列最大
  return codes.sort().at(-1) ?? null;
}

export async function GET() {
  const fallback = (reason: string) =>
    NextResponse.json(
      {
        source: {
          statsDataId: STATS_DATA_ID,
          timeCode: null,
          areaCode: null,
          itemCode: null,
        },
        unit: "円",
        items: [],
        unmappedItems: {},
        error: reason,
      },
      { status: 200 }
    );

  const appId = process.env.ESTAT_APP_ID;
  if (!appId) {
    return fallback("ESTAT_APP_ID が未設定です（.env.local を確認）");
  }

  // まずはメタ込みで取得（開発 & 自動判別用）
  const url = new URL(ESTAT_ENDPOINT);
  url.searchParams.set("appId", appId);
  url.searchParams.set("lang", "J");
  url.searchParams.set("statsDataId", STATS_DATA_ID);
  url.searchParams.set("metaGetFlg", "Y");
  url.searchParams.set("cntGetFlg", "N");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      cache: "no-store",
    });
  } catch {
    return fallback("e-Stat fetch failed");
  }

  if (!res.ok) {
    return fallback(`e-Stat fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as EstatResponse;
  const root = json.GET_STATS_DATA;

  const status = root?.RESULT?.STATUS;
  if (status && status !== "0") {
    return NextResponse.json(
      { error: root?.RESULT?.ERROR_MSG ?? "e-Stat API error", status },
      { status: 502 },
    );
  }

  const stat = root?.STATISTICAL_DATA;
  const classObjs = toArray(stat?.CLASS_INF?.CLASS_OBJ);

  // どの@キーが何を意味するかは「CLASS_OBJの@id」に対応していることが多い
  // ただ表によって名称が微妙に変わるので、名前で探す（ある程度ロバスト）
  const ageObj = findClassObj(classObjs, ["世帯主の年齢階級", "年齢階級"]);
  const areaObj = findClassObj(classObjs, [
    "地域",
    "全国",
    "都道府県",
    "市区町村",
  ]);
  const timeObj = findClassObj(classObjs, ["時間", "時点", "月", "年"]);
  const itemObj = findClassObj(classObjs, ["用途分類", "費目", "支出"]);

  if (!ageObj || !timeObj || !itemObj) {
    return NextResponse.json(
      {
        error:
          "必要な分類（年代/時間/用途分類）の自動判別に失敗しました。CLASS_OBJを確認してください。",
        debug: {
          classObjNames: classObjs.map((o) => ({
            id: o["@id"],
            name: o["@name"],
          })),
        },
      },
      { status: 500 },
    );
  }

  // CLASS_OBJの実体（CLASS一覧つき）を取得
  const ageFull = classObjs.find((o) => o["@id"] === ageObj["@id"]);
  const areaFull = areaObj
    ? classObjs.find((o) => o["@id"] === areaObj["@id"])
    : undefined;
  const timeFull = classObjs.find((o) => o["@id"] === timeObj["@id"]);
  const itemFull = classObjs.find((o) => o["@id"] === itemObj["@id"]);

  // 全国コード（なければ null 扱い。表に地域がないケースもある）
  const nationalAreaCode =
    findClassCode(areaFull, ["全国", "全国計", "全国（全域）"]) ?? null;

  // 消費支出コード（表によって「消費支出」「支出合計」など）
  // ※カテゴリ別に返すので、絞り込みには使わない
  const spendingCode =
    findClassCode(itemFull, ["消費支出", "支出合計", "総支出", "実支出"]) ??
    null;

  // 最新時点
  const latestTimeCode = pickLatestTimeCode(timeFull);

  if (!latestTimeCode) {
    return NextResponse.json(
      { error: "最新の時点コードが決められませんでした（時間CLASSを確認）" },
      { status: 500 },
    );
  }

  // VALUEを抽出して整形
  const values = toArray(stat?.DATA_INF?.VALUE) as EstatValueRow[];

  // e-Stat VALUE の属性キーは "@cat01" 等になりがちだが、どのcatが年代/用途分類かは表依存。
  // ここでは「ageObj @id」「itemObj @id」「areaObj @id」「timeObj @id」から、
  // VALUE側に存在する属性名を推測するため、VALUEのキー集合からそれっぽいのを使う。
  // まずは典型の優先順位で当て、ダメならフォールバック。
  const sample = values[0] ?? {};
  const valueKeys = Object.keys(sample);

  const pickAttrKey = (preferred: string[]) =>
    preferred.find((k) => valueKeys.includes(k)) ?? null;

  // 多くの表は cat01/cat02/... に分類が入る
  // 年代・用途分類が cat 系に入っている想定で、まずは一般的な順で探す
  const timeKey = pickAttrKey(["@time"]);
  const areaKey = pickAttrKey(["@area"]);
  const catKeys = ["@cat01", "@cat02", "@cat03", "@cat04"].filter((k) =>
    valueKeys.includes(k),
  );

  // “年代”と“用途分類”がどのcatかは断定できないので、後でコード照合で決める
  const ageCodes = new Set(
    toArray(ageFull?.CLASS)
      .map((c) => c["@code"])
      .filter((code): code is string => !!code),
  );
  const itemCodes = new Set(
    toArray(itemFull?.CLASS)
      .map((c) => c["@code"])
      .filter((code): code is string => !!code),
  );

  const inferWhichCatIs = (codes: Set<string>) => {
    // あるcatキーについて、VALUEの中にそのコード集合に含まれる値が多い方を採用
    let best: { key: string; score: number } | null = null;
    for (const ck of catKeys) {
      let score = 0;
      for (const v of values.slice(0, 500)) {
        const code = v[ck];
        if (code && codes.has(code)) score++;
      }
      if (!best || score > best.score) best = { key: ck, score };
    }
    return best?.key ?? null;
  };

  const ageKey = inferWhichCatIs(ageCodes);
  const itemKey = inferWhichCatIs(itemCodes);

  if (!timeKey || !ageKey || !itemKey) {
    return NextResponse.json(
      {
        error:
          "VALUE属性（time/age/item）の推測に失敗しました。metaとVALUE構造を確認してください。",
        debug: { timeKey, areaKey, catKeys, ageKey, itemKey },
      },
      { status: 500 },
    );
  }

  const ageNameByCode = new Map(
    toArray(ageFull?.CLASS).map(
      (c) => [c["@code"] ?? "", c["@name"] ?? ""] as const,
    ),
  );
  const itemNameByCode = new Map(
    toArray(itemFull?.CLASS).map(
      (c) => [c["@code"] ?? "", c["@name"] ?? ""] as const,
    ),
  );

  // 抽出：最新時点 × （全国なら全国） × 年代別 × 用途分類（費目）
  const filtered = values.filter((v) => {
    if (timeKey && v[timeKey] !== latestTimeCode) return false;
    if (areaKey && nationalAreaCode && v[areaKey] !== nationalAreaCode)
      return false;
    // 年代コードが存在するもの
    const a = v[ageKey];
    return typeof a === "string" && ageCodes.has(a);
  });

  // 年代×カテゴリごとに集計
  const unit = filtered.find((v) => v["@unit"])?.["@unit"] ?? "円";
  const byAge = new Map<string, Record<CategoryKey, number>>();
  const unmappedItems: Record<string, number> = {};

  for (const v of filtered) {
    const ageCode = v[ageKey] as string;
    const itemCode = v[itemKey] as string | undefined;
    if (!itemCode) continue;
    if (spendingCode && itemCode === spendingCode) continue;

    const raw = v.$ ?? "";
    const num = Number(raw);
    if (!Number.isFinite(num)) continue;

    const itemName = itemNameByCode.get(itemCode) ?? "";
    const mappedKey = mapItemNameToCategory(itemName);
    if (!mappedKey) {
      unmappedItems[itemName] = (unmappedItems[itemName] ?? 0) + num;
      continue;
    }

    if (!byAge.has(ageCode)) {
      byAge.set(
        ageCode,
        CATEGORY_KEYS.reduce(
          (acc, key) => ({ ...acc, [key]: 0 }),
          {} as Record<CategoryKey, number>,
        ),
      );
    }
    const current = byAge.get(ageCode)!;
    current[mappedKey] += num;
  }

  // 出力：年代名でソート（コードが数値っぽいならコード順）
  const items = Array.from(byAge.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ageCode, categories]) => ({
      ageCode,
      age: ageNameByCode.get(ageCode) ?? ageCode,
      categories,
    }));

  return NextResponse.json({
    source: {
      statsDataId: STATS_DATA_ID,
      timeCode: latestTimeCode,
      areaCode: nationalAreaCode, // null のこともある
      itemCode: spendingCode, // 参照用
    },
    unit,
    items,
    unmappedItems,
  });
}

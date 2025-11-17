// data/ageGroupData.ts
import { ExpenseMedian } from "./prefectureData";

export type AgeGroup =
  | "all"
  | "under29"
  | "thirties"
  | "forties"
  | "fifties"
  | "sixties"
  | "seventiesPlus";

export const ageGroupLabels: Record<AgeGroup, string> = {
  all: "全体（年齢指定なし）",
  under29: "〜29歳",
  thirties: "30〜39歳",
  forties: "40〜49歳",
  fifties: "50〜59歳",
  sixties: "60〜69歳",
  seventiesPlus: "70歳以上",
};

// ※金額はあくまで「目安としてのサンプル値」
//   あとで総務省の正式データに差し替えやすいように、項目だけそろえておくイメージ。
export const ageGroupMedians: Record<AgeGroup, ExpenseMedian> = {
  all: {
    food: 40000,
    utilities: 12000,
    dailyGoods: 8000,
    rent: 60000,
    transport: 10000,
    subscription: 5000,
    entertainment: 10000,
    medicalInsurance: 8000,
  },
  under29: {
    food: 35000,
    utilities: 9000,
    dailyGoods: 7000,
    rent: 60000,
    transport: 12000,
    subscription: 6000,
    entertainment: 12000,
    medicalInsurance: 4000,
  },
  thirties: {
    food: 40000,
    utilities: 12000,
    dailyGoods: 8000,
    rent: 65000,
    transport: 12000,
    subscription: 6000,
    entertainment: 10000,
    medicalInsurance: 7000,
  },
  forties: {
    food: 45000,
    utilities: 13000,
    dailyGoods: 9000,
    rent: 65000,
    transport: 12000,
    subscription: 6000,
    entertainment: 9000,
    medicalInsurance: 9000,
  },
  fifties: {
    food: 43000,
    utilities: 14000,
    dailyGoods: 8500,
    rent: 60000,
    transport: 10000,
    subscription: 5000,
    entertainment: 8000,
    medicalInsurance: 11000,
  },
  sixties: {
    food: 40000,
    utilities: 14000,
    dailyGoods: 8000,
    rent: 50000,
    transport: 8000,
    subscription: 4000,
    entertainment: 7000,
    medicalInsurance: 13000,
  },
  seventiesPlus: {
    food: 38000,
    utilities: 13000,
    dailyGoods: 7500,
    rent: 40000,
    transport: 6000,
    subscription: 3000,
    entertainment: 6000,
    medicalInsurance: 15000,
  },
};

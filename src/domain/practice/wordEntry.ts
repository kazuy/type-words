export type WordEntry = {
  number: number;
  word: { en: string; ja: string };
  sentences: { en: string; ja: string }[];
};

const fruits = [
  ["apple", "りんご", "This is an apple.", "これはりんごです。"],
  ["banana", "バナナ", "I eat a banana.", "私はバナナを食べます。"],
  ["orange", "オレンジ", "This orange is sweet.", "このオレンジは甘いです。"],
  ["grape", "ぶどう", "I see a purple grape.", "紫色のぶどうが見えます。"],
  ["strawberry", "いちご", "This strawberry is red.", "このいちごは赤いです。"],
  ["peach", "桃", "I like this peach.", "私はこの桃が好きです。"],
  ["pear", "梨", "This pear is juicy.", "この梨はみずみずしいです。"],
  [
    "cherry",
    "さくらんぼ",
    "This cherry is small.",
    "このさくらんぼは小さいです。",
  ],
  ["lemon", "レモン", "This lemon is sour.", "このレモンは酸っぱいです。"],
  ["lime", "ライム", "This lime is green.", "このライムは緑色です。"],
  ["mango", "マンゴー", "I cut a mango.", "私はマンゴーを切ります。"],
  [
    "pineapple",
    "パイナップル",
    "This pineapple is big.",
    "このパイナップルは大きいです。",
  ],
  [
    "watermelon",
    "スイカ",
    "We share a watermelon.",
    "私たちはスイカを分け合います。",
  ],
  [
    "melon",
    "メロン",
    "This melon smells good.",
    "このメロンはよい香りがします。",
  ],
  ["kiwi", "キウイ", "I eat a kiwi.", "私はキウイを食べます。"],
  ["plum", "プラム", "This plum is soft.", "このプラムは柔らかいです。"],
  ["apricot", "あんず", "This apricot is ripe.", "このあんずは熟しています。"],
  [
    "blueberry",
    "ブルーベリー",
    "This blueberry is tiny.",
    "このブルーベリーはとても小さいです。",
  ],
  [
    "raspberry",
    "ラズベリー",
    "I found a raspberry.",
    "私はラズベリーを見つけました。",
  ],
  [
    "grapefruit",
    "グレープフルーツ",
    "I like apples, pears, and grapefruit.",
    "私はりんご、梨、グレープフルーツが好きです。",
  ],
];

export const sampleWords: WordEntry[] = fruits.map(
  ([en, ja, sentenceEn, sentenceJa], index) => ({
    number: index + 1,
    word: { en, ja },
    sentences: [{ en: sentenceEn, ja: sentenceJa }],
  }),
);

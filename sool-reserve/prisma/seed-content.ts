// 데모 매거진·양조장 비주얼 테마 — 모든 인물·양조장·상품은 가상입니다.
import type { ArticleCategory } from "@prisma/client";

export const BREWERY_THEMES: Record<string, string> = {
  yeogangjae: "field",
  seorim: "courtyard",
  ongodang: "hanok",
  cheongunjae: "still",
  seolbong: "snow",
  wolchul: "herb",
  oreum: "island",
  sagwabat: "orchard",
  solnae: "mountain",
  sanjeong: "lake",
};

export interface DemoArticle {
  slug: string;
  title: string;
  subtitle: string;
  category: ArticleCategory;
  excerpt: string;
  coverTheme: string;
  brewery?: string;
  products: string[];
  daysAgo: number;
  body: string;
}

export const ARTICLES: DemoArticle[] = [
  {
    slug: "what-makes-sool-precious",
    title: "귀한 술은 무엇으로 만들어지는가",
    subtitle: "Water, Rice, Nuruk and Time",
    category: "STORY",
    excerpt: "쌀과 물, 누룩. 재료는 단순하지만 그 조합과 기다림의 방식이 술의 격을 가릅니다. 한국 전통주를 이루는 네 가지 요소를 정리했습니다.",
    coverTheme: "hanok",
    products: ["seorim-chapssal-yakju", "cheongun-45", "sanjeong-junmai"],
    daysAgo: 3,
    body: `## 쌀 — 술의 뼈대
전통주의 대부분은 쌀에서 시작합니다. 멥쌀은 깔끔하고 곧은 인상을, 찹쌀은 둥글고 부드러운 단맛을 남깁니다. 쌀을 얼마나 깎아내느냐(도정)에 따라서도 향의 결이 달라집니다.

## 물 — 보이지 않는 절반
술의 대부분은 물입니다. 양조장들이 오래도록 같은 자리를 지키는 이유 중 하나는 그 땅의 물 때문입니다. 경도와 미네랄의 차이가 발효의 속도와 맛의 질감을 바꿉니다.

## 누룩 — 한국 술의 서명
누룩은 곡물에 자연의 곰팡이와 효모를 길러낸 발효제입니다. 밀, 쌀, 녹두 등 무엇으로 빚었는지, 어느 계절에 띄웠는지에 따라 술의 향이 달라집니다. 같은 쌀과 물로도 누룩이 다르면 전혀 다른 술이 됩니다.

> 좋은 누룩은 서두르지 않는 계절에서 나옵니다.

## 시간 — 가장 비싼 재료
밑술에 덧술을 더하는 이양주·삼양주, 수개월에서 수년에 이르는 숙성. 시간은 원가표에 잘 드러나지 않지만 가장 큰 차이를 만드는 재료입니다.

- 이양주·삼양주: 덧술을 거듭할수록 맛이 깊고 안정적
- 저온 장기 발효: 향이 섬세하고 맑아짐
- 옹기·오크 숙성: 질감과 여운이 길어짐

SOOL RESERVE가 술을 고를 때 가장 먼저 묻는 것도 이 네 가지입니다. 무엇으로, 어디서, 어떻게, 얼마나 기다려 빚었는가.`,
  },
  {
    slug: "interview-cheongunjae-fire-and-patience",
    title: "불 앞에서 기다린 시간만큼",
    subtitle: "An Interview at Cheongunjae Distillery",
    category: "INTERVIEW",
    excerpt: "4대째 소줏고리를 지키는 청운재 증류소. 증류를 맡은 양조인에게 '기다림'에 대해 물었습니다.",
    coverTheme: "still",
    brewery: "cheongunjae",
    products: ["cheongun-45", "cheongun-10-years"],
    daysAgo: 9,
    body: `새벽 다섯 시, 증류실의 아궁이에 불이 들어갑니다. 청운재 증류소의 하루는 늘 같은 시각에 시작됩니다.

## 소줏고리를 고집하는 이유
"설비를 바꾸면 훨씬 빠르고 일정하게 만들 수 있습니다. 그런데 그러면 우리 집 술이 아니게 돼요. 불의 세기를 손으로 조절하고, 처음과 끝에 나오는 술을 눈과 코로 갈라내는 일. 그게 이 술의 성격을 만듭니다."

> 술은 기술보다 태도에서 맑아집니다.

## 옹기에서 보내는 시간
증류한 원액은 옹기에서 최소 3년을 보냅니다. 숨 쉬는 그릇 안에서 거친 기운이 가라앉고, 누룩의 구수함이 둥글게 자리를 잡습니다.

"10년 숙성은 해마다 몇 백 병밖에 나오지 않아요. 더 만들 수 있으면 좋겠지만, 시간은 살 수가 없으니까요."

## 다음 세대에게
양조인은 아들에게 레시피보다 먼저 '기록하는 법'을 가르친다고 했습니다. 날씨, 쌀의 상태, 불의 세기, 그날의 향. 그 기록이 쌓여 집안의 술이 됩니다.`,
  },
  {
    slug: "holiday-gift-guide-by-recipient",
    title: "받는 분을 생각하는 명절 전통주 선물법",
    subtitle: "A Gift Guide for the Holidays",
    category: "GIFT_GUIDE",
    excerpt: "부모님, 은사, 거래처 대표님. 받는 분의 취향과 자리에 맞춰 고르는 기준을 정리했습니다.",
    coverTheme: "courtyard",
    products: ["seorim-chapssal-yakju", "sanjeong-heritage", "sagwabat-brandy-40", "yeogang-25"],
    daysAgo: 15,
    body: `좋은 선물은 비싼 것이 아니라 받는 분을 오래 생각한 흔적이 보이는 것입니다. 전통주 선물을 고를 때 도움이 되는 세 가지 질문을 정리했습니다.

## 1. 어떤 자리에서 열리게 될까
명절 상에 오를 술이라면 음식과 잘 어울리는 약주나 청주가 좋습니다. 서재에 오래 두고 천천히 즐기실 분께는 숙성 증류주가 어울립니다.

## 2. 받는 분의 취향은
- 단맛을 즐기시는 분: 찹쌀로 빚은 약주
- 깔끔한 맛을 선호하시는 분: 고도정 청주
- 위스키를 즐기시는 분: 오크 숙성 증류주

## 3. 포장은 어떻게
오동나무 상자, 한지 포장, 보자기. 전통 소재의 포장은 그 자체로 이야기가 됩니다. 손글씨 메시지 카드를 더하면 마음이 한 번 더 전해집니다.

> 선물은 술을 건네는 일이 아니라, 시간을 건네는 일입니다.

기업 단위의 대량 선물은 예산과 수량에 맞춰 구성을 제안해 드립니다. 기업 VIP 상담을 이용해 주세요.`,
  },
  {
    slug: "pairing-yakju-and-korean-table",
    title: "약주와 한식, 서로를 완성하는 조합",
    subtitle: "Pairing Notes",
    category: "PAIRING",
    excerpt: "전과 나물, 수육, 생선구이. 우리 밥상에 오르는 음식과 전통주를 맞추는 간단한 원칙.",
    coverTheme: "field",
    products: ["seorim-chapssal-yakju", "ongo-takju-12", "oreum-omegi"],
    daysAgo: 22,
    body: `페어링의 원칙은 어렵지 않습니다. 비슷한 것끼리 겹치거나, 서로 다른 것이 균형을 맞추거나.

## 기름진 음식에는 산미
전과 육전처럼 기름진 음식에는 산미가 있는 탁주나 약주가 입안을 정리해 줍니다. 크리미한 탁주의 질감은 부침개의 바삭함과도 잘 어울립니다.

## 섬세한 음식에는 맑은 술
흰살생선, 신선로처럼 섬세한 맛에는 향이 맑은 청주가 음식의 결을 해치지 않습니다.

## 단맛은 단맛과
약과나 곶감 같은 전통 디저트에는 찹쌀 약주의 단맛이 겹쳐 여운이 길어집니다.

- 육전 + 탁주: 산미가 기름기를 정리
- 도미회 + 청주: 맑은 향이 생선의 단맛을 살림
- 약과 + 찹쌀 약주: 단맛이 겹쳐 긴 여운

적당한 양을 음식과 함께 천천히 즐기는 것이 전통주를 가장 잘 이해하는 방법입니다.`,
  },
  {
    slug: "storage-and-serving-guide",
    title: "전통주 보관과 음용 온도 안내",
    subtitle: "Storage & Serving",
    category: "GUIDE",
    excerpt: "생탁주는 왜 냉장 보관해야 할까요? 증류주는 어떤 온도에서 향이 잘 열릴까요? 주종별 기본 가이드.",
    coverTheme: "lake",
    products: ["seolbong-sparkling", "cheongun-45", "sanjeong-junmai"],
    daysAgo: 30,
    body: `같은 술도 보관과 온도에 따라 전혀 다른 인상을 줍니다. 상품 상세의 권장값이 가장 정확하지만, 주종별 기본 원칙을 알아두면 도움이 됩니다.

## 살아 있는 술, 생주
살균하지 않은 생탁주와 생약주에는 효모가 살아 있습니다. 냉장 보관하지 않으면 발효가 계속되어 맛이 빠르게 변합니다. 병내 발효 스파클링은 개봉 시 기포가 강하니 차갑게 식힌 뒤 천천히 여세요.

## 증류주
도수가 높은 증류주는 상온 보관이 가능합니다. 직사광선을 피해 세워서 보관하세요. 상온에서 향이 잘 열리며, 취향에 따라 물 몇 방울을 더하기도 합니다.

## 약주와 청주
서늘한 곳에 보관하고 개봉 후에는 냉장 보관을 권장합니다. 약간 차갑게 마시면 향이 맑게 느껴집니다.

- 생탁주·생약주: 0~5℃ 냉장, 개봉 후 빠르게
- 약주·청주: 서늘한 곳, 개봉 후 냉장
- 증류주: 상온, 직사광선 차단

권장 음용 온도는 상품마다 다릅니다. 각 상품 상세의 '음용 가이드'를 확인해 주세요.`,
  },
  {
    slug: "jeju-millet-and-tangerine",
    title: "돌담 너머, 좁쌀과 감귤의 섬",
    subtitle: "A Visit to Oreum Sool House, Jeju",
    category: "TRAVEL",
    excerpt: "논이 귀한 섬에서 사람들은 좁쌀로 술을 빚었습니다. 그 전통을 다시 잇는 작은 술빚는집을 찾았습니다.",
    coverTheme: "island",
    brewery: "oreum",
    products: ["oreum-omegi", "oreum-gamgyul"],
    daysAgo: 38,
    body: `현무암 돌담이 낮게 이어진 마을. 바람이 많은 섬에서는 쌀 대신 조와 보리가 밥이 되었고, 술도 그 곡식으로 빚었습니다.

## 오메기떡에서 시작하는 술
차좁쌀을 빻아 동그랗게 빚은 오메기떡을 삶아 밑술을 만듭니다. 고소하면서도 상큼한 산미가 이 섬의 술의 개성입니다.

> 섬의 바람과 돌, 물을 술에 담습니다.

## 화산암반수
빗물이 화산암 지층을 지나며 걸러진 물은 부드럽고 깨끗합니다. 양조인은 "이 물이 없으면 이 맛도 없다"고 말합니다.

## 겨울의 감귤
수확철이 되면 술빚는집은 감귤 향으로 가득합니다. 노지 감귤만 착즙해 병 안에서 천천히 기포를 만든 과실주는 섬의 겨울을 닮았습니다.`,
  },
];

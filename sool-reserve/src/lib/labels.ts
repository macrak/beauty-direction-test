// 화면 표시용 라벨 — enum 값과 한국어 표기를 한 곳에서 관리
export const LIQUOR_TYPE_LABEL = {
  DISTILLED_SOJU: "증류식 소주",
  YAKJU: "약주",
  CHEONGJU: "청주",
  TAKJU: "탁주",
  FRUIT_WINE: "과실주",
  OTHER: "기타 전통주",
} as const;

export const LEGAL_CLASS_LABEL = {
  FOLK: "민속주",
  REGIONAL: "지역특산주",
  NONE: "해당 없음(일반 주류)",
  UNKNOWN: "미확인",
} as const;

export const ELIGIBILITY_LABEL = {
  UNCHECKED: "미확인",
  IN_REVIEW: "검토 중",
  VERIFIED: "통신판매 적격 확인",
  INELIGIBLE: "부적격 · 소개 전용",
} as const;

export const ONBOARDING_LABEL = {
  APPLIED: "입점 신청",
  DOCS_REVIEW: "서류 확인",
  PRODUCT_REVIEW: "상품 검토",
  PROFIT_REVIEW: "수익성 검토",
  CONTRACT: "계약",
  APPROVED: "관리자 승인",
  LISTED: "상품 노출",
  REJECTED: "반려",
} as const;

export const ONBOARDING_FLOW = [
  "APPLIED",
  "DOCS_REVIEW",
  "PRODUCT_REVIEW",
  "PROFIT_REVIEW",
  "CONTRACT",
  "APPROVED",
  "LISTED",
] as const;

export const PRODUCT_STATUS_LABEL = {
  DRAFT: "작성 중",
  REVIEW: "검토 대기",
  PUBLISHED: "공개",
  HIDDEN: "숨김",
} as const;

export const TASTE_SOURCE_LABEL = {
  MANUFACTURER: "제조사 제공 정보",
  IN_HOUSE: "SOOL RESERVE 자체 테이스팅",
  NONE: "미등록",
} as const;

export const TASTE_AXES = [
  { key: "tasteSweetness", label: "단맛" },
  { key: "tasteAcidity", label: "산미" },
  { key: "tasteBody", label: "바디감" },
  { key: "tasteCarbonation", label: "탄산감" },
  { key: "tasteAroma", label: "향의 강도" },
] as const;

export const SCORE_FIELDS = [
  { key: "scoreEligibility", label: "온라인 판매 적격" },
  { key: "scoreReputation", label: "양조장 신뢰도" },
  { key: "scoreStory", label: "브랜드 스토리" },
  { key: "scoreQuality", label: "품질·완성도" },
  { key: "scoreRarity", label: "희소성" },
  { key: "scoreDesign", label: "병·패키지 디자인" },
  { key: "scoreGift", label: "선물 적합성" },
  { key: "scoreProfit", label: "예상 수익" },
  { key: "scoreSupply", label: "공급 안정성" },
  { key: "scoreLogistics", label: "배송·보관 용이성" },
] as const;

export type ScoreKey = (typeof SCORE_FIELDS)[number]["key"];

export const OCCASIONS = [
  "혼자 즐기는 술",
  "특별한 식사",
  "홈파티",
  "캠핑",
  "부모님 선물",
  "명절 선물",
  "기업 VIP 선물",
  "컬렉션 및 소장용",
] as const;

export const GIFT_PURPOSES = [
  { key: "부모님 선물", en: "For Parents", desc: "감사의 마음을 오래 남는 한 병으로" },
  { key: "VIP 선물", en: "For VIP", desc: "품격으로 기억되는 선택" },
  { key: "기업 선물", en: "Corporate", desc: "브랜드의 태도를 담은 선물" },
  { key: "명절 선물", en: "Holiday", desc: "설과 추석, 한 해의 인사" },
  { key: "결혼 및 기념일 선물", en: "Celebration", desc: "함께 기억할 날을 위한 술" },
  { key: "특별한 감사 선물", en: "Gratitude", desc: "말로 다 못한 고마움" },
] as const;

export const PAIRING_CATEGORIES = ["한식", "육류", "해산물", "치즈", "디저트", "퓨전 요리"] as const;

export const SHIP_DAYS = ["월", "화", "수", "목", "금", "토"] as const;

export const ROLE_LABEL = {
  SUPER_ADMIN: "최고관리자",
  CURATOR: "큐레이터",
  FINANCE: "재무",
  BREWERY_ADMIN: "양조장 관리자",
} as const;

export const NOTICE_TYPE_LABEL = {
  HEALTH_WARNING: "음주 경고문구",
  YOUTH_NOTICE: "청소년 판매 금지 고지",
  INTERMEDIARY: "통신판매중개자 고지",
  TERMS: "이용약관",
  PRIVACY: "개인정보 처리방침",
  SHIPPING_POLICY: "배송 정책",
  RETURN_POLICY: "교환·반품 정책",
} as const;

export const INQUIRY_TYPE_LABEL = {
  PARTNERSHIP: "입점 문의",
  CORPORATE: "기업 VIP 상담",
  CUSTOMER: "고객 문의",
  NEWSLETTER: "정보 구독",
} as const;

export const INQUIRY_STATUS_LABEL = {
  NEW: "신규",
  IN_PROGRESS: "처리 중",
  DONE: "완료",
  ARCHIVED: "보관",
} as const;

export const SLOT_LABEL = {
  MAIN: "메인 추천",
  GIFT: "프리미엄 기프트 추천",
  PROFIT: "고수익 상품",
  LIMITED: "한정판 추천",
  SEASONAL: "시즌 추천",
} as const;

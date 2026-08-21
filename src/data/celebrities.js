// 기본 연예인 데이터 (6명)
const baseCelebrities = [
  { id: 1, name: '이민호', gender: 'male', description: '클래식한 남자 메이크업 튜토리얼' },
  { id: 2, name: '박보검', gender: 'male', description: '자연스러운 피부 표현 팁' },
  { id: 3, name: '송강', gender: 'male', description: '볼륨감을 살린 헤어 연출' },
  { id: 4, name: '전지현', gender: 'female', description: '글로우 스킨 메이크업' },
  { id: 5, name: '아이유', gender: 'female', description: '데일리 립 컬러 추천' },
  { id: 6, name: '수지', gender: 'female', description: '청순 메이크업 완성법' },
];

// 자동 생성: 24명 추가 => 총 30명
const autoCelebrities = Array.from({ length: 24 }, (_, i) => ({
  id: 7 + i,
  name: `연예인 ${7 + i}`,
  gender: i % 2 === 0 ? 'male' : 'female',
  description: `샘플 설명 ${7 + i}`,
}));

export const sampleCelebrities = [
  ...baseCelebrities,
  ...autoCelebrities,
];

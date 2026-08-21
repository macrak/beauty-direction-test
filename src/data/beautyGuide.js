// 성형 없이 원하는 스타일에 가까워지는 방향을 제안하기 위한 규칙 기반 가이드 데이터

export const faceShapeOptions = [
  { value: 'oval', label: '계란형', advice: '이미 균형 잡힌 형태라 다양한 헤어스타일이 잘 어울려요. 원하는 스타일의 헤어 라인을 그대로 시도해봐도 좋아요.' },
  { value: 'round', label: '둥근형', advice: '얼굴 옆선을 살짝 가려주는 레이어드 컷이나 사이드 뱅으로 세로 라인을 강조하면 좀 더 갸름해 보여요.' },
  { value: 'square', label: '각진형', advice: '턱선을 부드럽게 감싸는 웨이브나 앞머리로 각진 인상을 완화할 수 있어요.' },
  { value: 'long', label: '긴형', advice: '이마를 가리는 앞머리나 볼륨감 있는 사이드 헤어로 세로 길이를 시각적으로 줄여보세요.' },
  { value: 'heart', label: '하트형', advice: '턱 라인에 볼륨을 주는 헤어스타일로 이마와 턱의 균형을 맞춰보세요.' },
];

export const eyeShapeOptions = [
  { value: 'big', label: '큰 눈', advice: '이미 존재감 있는 눈이라 자연스러운 브라운 계열로 은은하게 강조하면 부담 없어요.' },
  { value: 'small', label: '작은 눈', advice: '눈꼬리를 살짝 늘려주는 아이라인과 밝은 펄 섀도우로 눈매를 확장해보세요.' },
  { value: 'downturned', label: '처진 눈', advice: '눈꼬리를 사선으로 살짝 올려주는 아이라인으로 또렷한 인상을 만들 수 있어요.' },
  { value: 'upturned', label: '올라간 눈', advice: '눈 앞머리 쪽에 포인트를 주면 더 또렷하면서도 부드러운 인상이 돼요.' },
  { value: 'monolid', label: '무쌍', advice: '자연스러운 그라데이션 섀도우로 입체감을 더하면 눈매가 또렷해 보여요.' },
];

export const skinToneOptions = [
  { value: 'warm', label: '웜톤', advice: '코랄·피치 계열 컬러가 잘 어울려요. 골드 하이라이터로 생기를 더해보세요.' },
  { value: 'cool', label: '쿨톤', advice: '핑크·베리 계열이 잘 받고, 실버 톤 하이라이터가 화사함을 더해줘요.' },
  { value: 'neutral', label: '뉴트럴', advice: '웜톤과 쿨톤 컬러를 폭넓게 소화할 수 있어요. 그날 원하는 무드에 맞춰 자유롭게 시도해보세요.' },
];

const findAdvice = (options, value) =>
  (options.find(option => option.value === value) || {}).advice;

// 원하는 스타일(연예인)과 내 얼굴 특징을 조합해 방향성 메시지를 생성
export function generateDirection(celebrity, { faceShape, eyeShape, skinTone }) {
  const faceAdvice = findAdvice(faceShapeOptions, faceShape);
  const eyeAdvice = findAdvice(eyeShapeOptions, eyeShape);
  const skinAdvice = findAdvice(skinToneOptions, skinTone);

  return {
    intro: `"${celebrity.description}" 스타일을 원하신다면, 성형 없이도 아래 방향으로 먼저 시도해볼 수 있어요.`,
    points: [
      { title: '헤어 · 윤곽', text: faceAdvice },
      { title: '눈매 메이크업', text: eyeAdvice },
      { title: '피부 · 컬러', text: skinAdvice },
    ],
    outro: '지금의 얼굴도 이 스타일을 소화할 수 있는 가능성을 충분히 가지고 있어요. 위 포인트를 하나씩 시도하면서 나답게 예뻐지는 방향을 찾아보세요.',
  };
}

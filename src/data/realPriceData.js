// 찐가격(Real Price) 데이터 로딩 + 통계 유틸
// 원본 Next.js 버전은 서버 API에서 계산했지만, 이 앱은 GitHub Pages에 배포되는
// 정적 사이트라 백엔드가 없다. 대신 빌드 타임에 미리 집계해둔
// public/data/real-price-*.json (scripts/generate-real-price-data.js 참고)을
// 클라이언트에서 fetch해서 그대로 쓴다.

const STATS_URL = `${process.env.PUBLIC_URL}/data/real-price-stats.json`;
const HOSPITALS_URL = `${process.env.PUBLIC_URL}/data/real-price-hospitals.json`;

let statsPromise = null;
let hospitalsPromise = null;

export function loadProcedureStats() {
  if (!statsPromise) {
    statsPromise = fetch(STATS_URL).then((r) => r.json());
  }
  return statsPromise;
}

export function loadHospitalIndex() {
  if (!hospitalsPromise) {
    hospitalsPromise = fetch(HOSPITALS_URL).then((r) => r.json());
  }
  return hospitalsPromise;
}

export async function getProcedureStats(category, q) {
  const all = await loadProcedureStats();
  return all.filter(
    (r) => (!category || r.category === category) && (!q || r.name.includes(q))
  );
}

export async function getCuratedProcedureStats(category) {
  const whitelist = CURATED_PROCEDURES[category] || [];
  const all = await getProcedureStats(category);
  const byName = new Map(all.map((r) => [r.name, r]));
  return whitelist.filter((name) => byName.has(name)).map((name) => byName.get(name));
}

export async function getHospitalPricing(q) {
  const index = await loadHospitalIndex();
  let name = Object.prototype.hasOwnProperty.call(index, q) ? q : null;
  if (!name) {
    name = Object.keys(index).find((h) => h.includes(q)) || null;
  }
  if (!name) return null;
  const items = index[name].map(([proc, price, n]) => ({ proc, price, n }));
  return { name, items };
}

// 견적 계산기용 카테고리별 대표 시술 화이트리스트
// (전체 노출 시 롱테일 노이즈가 커서, 데이터건수 상위 기준으로 선별했다)
export const CURATED_PROCEDURES = {
  성형외과: [
    '쌍꺼풀수술', '코성형', '눈매교정술', '안면윤곽술', '지방흡입',
    '가슴확대술', '모발이식술', '이마 거상술', '사각턱 축소술', '앞트임 수술',
  ],
  피부과: [
    '보톡스', '필러', '울쎄라 리프팅', '슈링크 리프팅', '리쥬란힐러(스킨부스터)',
    '레이저 제모', '여드름 치료', '포텐자 시술(RF마이크로니들링)', '아쿠아필 필링',
  ],
  치과: [
    '스케일링(치석제거)', '임플란트', '치아교정', '치아미백', '사랑니 발치', '신경치료', '크라운 치료',
  ],
};

export const CATEGORIES = ['성형외과', '피부과', '치과'];

// 제보 데이터: 백엔드가 없으므로 브라우저 localStorage에 저장한다.
// (원본 Next.js 버전은 로컬 JSON 파일에 썼는데, 정적 사이트에서는 그마저도
// 불가능해서 클라이언트 저장소로 대체했다. 실서비스 전환 시
// real-price-api-spec.md 스펙대로 진짜 DB로 옮겨야 한다.)
const SUBMISSIONS_KEY = 'realPriceSubmissions';

export function getStoredSubmissions() {
  try {
    const raw = window.localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addStoredSubmission(submission) {
  const subs = [submission, ...getStoredSubmissions()].slice(0, 20);
  try {
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
  } catch {
    // localStorage 사용 불가 (프라이빗 모드 등) — 화면에만 반영되고 저장은 되지 않는다.
  }
  return subs;
}

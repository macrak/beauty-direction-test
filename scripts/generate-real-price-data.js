#!/usr/bin/env node
/**
 * 찐가격(Real Price) 데이터 생성 스크립트
 *
 * 원본 시술가 데이터(procedure_pricing.json, 10만 건 이상)를 그대로 클라이언트에
 * 내려주면 번들 크기가 너무 커지므로, 빌드 타임에 두 개의 작은 인덱스로
 * 미리 집계해서 public/data/ 아래에 둔다.
 *
 * 사용법:
 *   node scripts/generate-real-price-data.js <원본 procedure_pricing.json 경로>
 */
const fs = require('fs');
const path = require('path');

const srcPath = process.argv[2];
if (!srcPath) {
  console.error('사용법: node scripts/generate-real-price-data.js <procedure_pricing.json 경로>');
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return sorted[idx];
}

// 1) 시술별 통계 인덱스 (카테고리+시술명으로 그룹핑)
const groups = new Map();
for (const r of rows) {
  const key = r.category + '||' + r.procedure_name;
  let g = groups.get(key);
  if (!g) { g = []; groups.set(key, g); }
  g.push(r);
}

const stats = [];
for (const [key, g] of groups) {
  const [category, name] = key.split('||');
  const prices = g.map((x) => x.price_avg).sort((a, b) => a - b);
  const hospitals = new Set(g.map((x) => x.hospital_id)).size;
  const reports = g.reduce((s, x) => s + x.report_count, 0);
  stats.push({
    name,
    category,
    p20: percentile(prices, 0.2),
    p50: percentile(prices, 0.5),
    p80: percentile(prices, 0.8),
    hospitals,
    reports,
  });
}
stats.sort((a, b) => b.reports - a.reports);

// 2) 병원별 인덱스 (병원명 -> [시술명, 가격, 제보건수][])
const hospitalIndex = {};
for (const r of rows) {
  let arr = hospitalIndex[r.hospital_name];
  if (!arr) { arr = []; hospitalIndex[r.hospital_name] = arr; }
  arr.push([r.procedure_name, r.price_avg, r.report_count]);
}

const outDir = path.join(__dirname, '..', 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'real-price-stats.json'), JSON.stringify(stats));
fs.writeFileSync(path.join(outDir, 'real-price-hospitals.json'), JSON.stringify(hospitalIndex));

console.log(`완료: 시술 ${stats.length}건, 병원 ${Object.keys(hospitalIndex).length}건`);

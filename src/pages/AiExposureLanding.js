import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Globe,
  Link2,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Star,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const exampleQueries = [
  '강남에 안면윤곽 잘하는 병원 추천해 줘',
  '양주 정형외과 추천해줘',
  '강동구 길동 치과 추천',
];

const processSteps = [
  {
    label: '01',
    title: '초기 세팅',
    points: [
      '홈페이지와 검색 수집 환경을 정리합니다.',
      '채널 정보를 맞추고 방문·상담 측정 도구를 연결합니다.',
    ],
  },
  {
    label: '02',
    title: '월간 운영',
    points: [
      '웹페이지·블로그·카페 콘텐츠를 작성합니다.',
      '외부 채널의 정보를 관리하고 매월 결과를 보고합니다.',
    ],
  },
  {
    label: '03',
    title: '성과 확인',
    points: [
      '병원명, 추천 순서와 답변 내용을 확인합니다.',
      '경쟁사와 비교해 다음 달 보완 내용을 정리합니다.',
    ],
  },
];

const setupScope = [
  {
    label: '01',
    title: 'AI 검색 진단',
    desc: '주요 질문에서 병원과 경쟁사의 노출을 확인합니다.',
  },
  {
    label: '02',
    title: '홈페이지 SEO',
    desc: '이미지 속 설명을 글로 정리하고 제목과 페이지 구성을 개선합니다.',
  },
  {
    label: '03',
    title: '검색 수집 환경',
    desc: '검색엔진이 홈페이지를 읽도록 기본 설정을 반영하고 점검합니다.',
  },
  {
    label: '04',
    title: '방문·상담 측정',
    desc: '방문과 문의 버튼 클릭 측정 도구를 연결하고 작동을 확인합니다.',
  },
  {
    label: '05',
    title: '채널 정보 일치',
    desc: '네이버 플레이스, 구글 지도, 카카오맵, 블로그와 운영 중인 SNS의 업체명·주소·전화번호·영업시간을 맞춥니다.',
  },
];

const monthlyWork = [
  {
    item: 'AI 검색·경쟁사 확인',
    basis: '월간 운영',
    detail: '정해 둔 질문으로 병원명·홈페이지와 경쟁사 노출 확인',
  },
  {
    item: '일반 검색용 글',
    basis: '웹페이지 월 8건 · 블로그 월 8건',
    detail: 'AI 인용을 위한 웹페이지·블로그 글 작성, 월 합계 16건',
  },
  {
    item: '통합 검색용 글',
    basis: '카페 2건',
    detail: '네이버 대표 카페를 이용한 콘텐츠 작성',
  },
  {
    item: '외부 채널 정보 관리',
    basis: '월간 운영',
    detail: '모두닥·굿닥 등 의료기관 플랫폼에 정보 게시·보완',
  },
  {
    item: '월간 결과 보고',
    basis: '매월',
    detail: '작업 내용, 검색 변화와 다음 달 계획 정리',
  },
];

const caseStudies = [
  {
    name: '덕계더바른의원',
    tag: '양주·덕계 정형외과',
    rank: '1순위',
    query: '양주 정형외과 추천해줘',
    desc: '병원명을 넣지 않은 지역 질문에서 첫 번째 추천 병원으로 소개됐습니다. 허리·목디스크와 관절 진료, 도수치료, 체외충격파 및 비수술 치료 정보가 추천 설명에 함께 담겼습니다.',
    image: `${process.env.PUBLIC_URL}/images/cases/duckgye.png`,
  },
  {
    name: '이수탑정형외과의원',
    tag: '이수·사당 정형외과',
    rank: '3순위',
    query: '이수 정형외과 추천해줘',
    desc: '지역과 진료과만 물었을 때도 추천 목록에 포함됐습니다. 이수역 인근 위치와 접근성, 진료시간 등 병원을 비교하는 데 필요한 정보가 함께 소개됐습니다.',
    image: `${process.env.PUBLIC_URL}/images/cases/isu.png`,
  },
  {
    name: '성북김준비뇨의학과의원',
    tag: '성북구 비뇨의학과',
    rank: '1순위',
    query: '성북 비뇨기과 추천',
    desc: '첨부 AI 답변에서 첫 번째 추천 병원으로 확인됐습니다. 한성대입구역 인근 생활권과 위치, 진료시간 및 외부 플랫폼 정보가 추천 설명에 함께 담겼습니다.',
    image: `${process.env.PUBLIC_URL}/images/cases/seongbuk.png`,
  },
  {
    name: '연세타이밍치과의원',
    tag: '강동구·길동 치과',
    rank: '추천 후보 노출',
    query: '강동구 길동 치과 추천',
    desc: '지역과 진료 목적을 묻는 질문에서 병원을 찾아보고 비교할 수 있게 됐습니다. 길동역 생활권과 임플란트·사랑니 진료 정보가 함께 정리돼 있습니다.',
    image: `${process.env.PUBLIC_URL}/images/cases/gangdong.png`,
  },
];

const whyContext = [
  {
    icon: Globe,
    title: '홈페이지 SEO 실행',
    desc: '제목·본문·페이지 구성과 검색 수집 환경을 직접 정비합니다.',
  },
  {
    icon: MapPin,
    title: '구글·네이버 노출 플랫폼',
    desc: '보유 플랫폼에서 진료·지역 콘텐츠를 운영합니다.',
  },
  {
    icon: Link2,
    title: '보유 카페와 제휴 카페',
    desc: '네이버 통합검색 노출에 활용할 카페 운영 기반을 갖췄습니다.',
  },
  {
    icon: BarChart3,
    title: '두 검색의 결과 확인',
    desc: 'AI 추천과 네이버 노출을 확인하고 매월 개선 방향을 보고합니다.',
  },
];

function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`px-6 ${className}`}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="text-sm font-semibold tracking-wide text-teal-600 mb-3">{children}</p>
  );
}

export default function AiExposureLanding() {
  const [form, setForm] = useState({ clinic: '', name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-white font-bold tracking-tight">맥락컨설팅</span>
          <button
            onClick={scrollToContact}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            무료 진단 신청
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-950 text-white px-6 pt-20 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <Eyebrow>왜 AI 추천 노출이 중요한가</Eyebrow>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl">
              환자가 병원명을 정하기 전에 <br className="hidden sm:block" />
              먼저 만나는 것은 <span className="text-teal-400">검색 결과</span>입니다
            </h1>
            <p className="mt-6 text-slate-300 max-w-2xl text-lg">
              이제 환자는 검색엔진 대신 생성형 AI에게 병원을 묻습니다. 질문은 더 구체적이고, 답은
              몇 개의 병원으로만 좁혀집니다. 그 안에 우리 병원이 있어야 합니다.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={scrollToContact}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors"
              >
                무료 진단 신청하기 <ArrowRight size={18} />
              </button>
              <a
                href="#pricing"
                className="border border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-full transition-colors"
              >
                비용 안내 보기
              </a>
            </div>
          </motion.div>

          {/* Stat card */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mt-16 grid sm:grid-cols-3 gap-4"
          >
            <div className="sm:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-4">
                검색엔진 대신 생성형 AI로 상품·서비스 추천을 받는다는 응답¹
              </p>
              <div className="flex items-end gap-8">
                <div>
                  <p className="text-xs text-slate-500 mb-1">2023년 11월</p>
                  <p className="text-4xl font-bold text-slate-400">25%</p>
                </div>
                <TrendingUp className="text-teal-400 mb-2" size={28} />
                <div>
                  <p className="text-xs text-slate-500 mb-1">2024년 11월</p>
                  <p className="text-4xl font-bold text-teal-400">58%</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-white">1년 사이 33%p 증가</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
              <p className="text-3xl font-bold text-white">절반 이상</p>
              <p className="mt-2 text-sm text-slate-400">
                국내 검색 이용자도 절반 이상이 ChatGPT·Gemini를 이용합니다.²
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem / example queries */}
      <Section className="py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Eyebrow>질문은 더 구체적입니다</Eyebrow>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            환자는 이렇게 묻고, AI는 몇 곳만 추천합니다
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {exampleQueries.map((q) => (
              <div
                key={q}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3"
              >
                <Search className="text-teal-600 shrink-0 mt-0.5" size={18} />
                <p className="text-slate-700 leading-relaxed">“{q}”</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* Case studies */}
      <Section className="py-20 bg-slate-50" id="cases">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
          <Eyebrow>실제 사례</Eyebrow>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            이미 AI 추천에 노출되고 있는 병원들
          </h2>
          <p className="text-slate-500 mb-10">
            실제 AI 검색 화면에서 확인한 결과입니다.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 items-start">
          {caseStudies.map((c) => (
            <motion.div
              key={c.name}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
            >
              <img
                src={c.image}
                alt={`${c.name} AI 추천 검색 결과`}
                className="w-full h-56 object-cover object-top"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                    <Star size={12} className="fill-teal-600 text-teal-600" /> {c.rank}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{c.tag}</p>
                <p className="text-sm text-slate-500 italic mb-3">“{c.query}”</p>
                <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-6">
          첨부 화면의 추천 순서입니다. 현재 순위 또는 향후 동일 결과를 보장하는 수치는 아닙니다.
        </p>
      </Section>

      {/* Process */}
      <Section className="py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Eyebrow>진행 방식</Eyebrow>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            초기 세팅 후, 콘텐츠 운영과 검색 결과 확인을 이어갑니다
          </h2>
        </motion.div>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {processSteps.map((s) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
            >
              <p className="text-sm font-bold text-teal-600 mb-2">{s.label}</p>
              <h3 className="text-lg font-bold text-slate-900 mb-4">{s.title}</h3>
              <ul className="space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={16} />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-10 overflow-x-auto"
        >
          <table className="w-full min-w-[560px] text-sm border border-slate-200 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left font-semibold px-5 py-3">초기 세팅</th>
                <th className="text-left font-semibold px-5 py-3">월간 운영</th>
                <th className="text-left font-semibold px-5 py-3">세팅과 6개월 운영 합계</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-5 py-4 border-t border-slate-200">1회 300만 원</td>
                <td className="px-5 py-4 border-t border-slate-200">월 120만 원 / 최소 6개월</td>
                <td className="px-5 py-4 border-t border-slate-200 font-bold text-teal-700">
                  1,020만 원
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-2">
            부가세 별도. 세부 금액과 연장 조건은 아래 비용 안내에서 확인하세요.
          </p>
        </motion.div>
      </Section>

      {/* Setup scope */}
      <Section className="py-20 bg-slate-50">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Eyebrow>초기 세팅 범위 · 1회 300만 원, 부가세 별도</Eyebrow>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            검색이 우리 병원을 제대로 읽도록 만듭니다
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-5">
          {setupScope.map((item) => (
            <motion.div
              key={item.label}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="bg-white rounded-2xl p-6 border border-slate-200 flex gap-4"
            >
              <span className="text-2xl font-bold text-slate-200">{item.label}</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Monthly work */}
      <Section className="py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Eyebrow>매월 진행하는 작업 · 월 120만 원, 최소 6개월, 부가세 별도</Eyebrow>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            세팅 이후, 꾸준한 콘텐츠와 점검이 순위를 지킵니다
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[640px] text-sm border border-slate-200 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left font-semibold px-5 py-3">서비스 항목</th>
                <th className="text-left font-semibold px-5 py-3">제공 기준</th>
                <th className="text-left font-semibold px-5 py-3">진행 내용</th>
              </tr>
            </thead>
            <tbody>
              {monthlyWork.map((row, i) => (
                <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-5 py-4 border-t border-slate-200 font-semibold text-slate-800 whitespace-nowrap">
                    {row.item}
                  </td>
                  <td className="px-5 py-4 border-t border-slate-200 text-slate-500 whitespace-nowrap">
                    {row.basis}
                  </td>
                  <td className="px-5 py-4 border-t border-slate-200 text-slate-600">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900"
        >
          <p className="font-semibold mb-1">운영 시 참고사항</p>
          질문의 경쟁도에 따라 추가 작업이 필요할 수 있습니다. 경쟁업체의 작업량에 따라 추천
          순위가 하락할 수 있으며, 순위 상승 후에도 유지와 경쟁력 강화를 위한 작업을 권장합니다.
        </motion.div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" className="py-20 bg-slate-950 text-white">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Eyebrow>비용과 운영 기간</Eyebrow>
          <h2 className="text-3xl font-bold mb-2">초기 세팅 1회와 최소 6개월 운영 기준</h2>
          <p className="text-slate-400 mb-10">
            착수 일정, 결제 시점, 관리 채널과 점검 질문은 계약 전 협의합니다.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[720px] text-sm border border-white/10 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="text-left font-semibold px-5 py-3">항목</th>
                <th className="text-left font-semibold px-5 py-3">단가</th>
                <th className="text-left font-semibold px-5 py-3">횟수·기간</th>
                <th className="text-left font-semibold px-5 py-3">합계</th>
                <th className="text-left font-semibold px-5 py-3">진행 기준</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr>
                <td className="px-5 py-4 border-t border-white/10">AI 노출 세팅</td>
                <td className="px-5 py-4 border-t border-white/10">300만 원</td>
                <td className="px-5 py-4 border-t border-white/10">1회</td>
                <td className="px-5 py-4 border-t border-white/10">300만 원</td>
                <td className="px-5 py-4 border-t border-white/10">초기 세팅</td>
              </tr>
              <tr>
                <td className="px-5 py-4 border-t border-white/10">AI 노출 최적화</td>
                <td className="px-5 py-4 border-t border-white/10">월 120만 원</td>
                <td className="px-5 py-4 border-t border-white/10">최소 6개월</td>
                <td className="px-5 py-4 border-t border-white/10">720만 원</td>
                <td className="px-5 py-4 border-t border-white/10">월간 운영</td>
              </tr>
              <tr className="font-bold text-white">
                <td className="px-5 py-4 border-t border-white/10">도입 합계</td>
                <td className="px-5 py-4 border-t border-white/10">—</td>
                <td className="px-5 py-4 border-t border-white/10">—</td>
                <td className="px-5 py-4 border-t border-white/10 text-teal-400">1,020만 원</td>
                <td className="px-5 py-4 border-t border-white/10">세팅 및 운영</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-6 grid sm:grid-cols-2 gap-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-sm text-slate-400 mb-1">부가세 포함 총액</p>
            <p className="text-3xl font-bold text-white">1,122만 원</p>
            <p className="text-sm text-slate-400 mt-2">
              공급가 1,020만 원 + 부가세 102만 원
              <br />
              세팅 330만 원, 월 운영 132만 원, 6개월 운영 792만 원은 부가세 포함 금액입니다.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-sm text-slate-400 mb-1">6개월 추가 운영</p>
            <p className="text-3xl font-bold text-white">월 120만 원</p>
            <p className="text-sm text-slate-400 mt-2">
              최초 6개월 이후 월 120만 원(부가세 별도)으로 연장할 수 있습니다.
              <br />
              추가 6개월 공급가 720만 원 / 부가세 포함 792만 원
            </p>
          </div>
        </motion.div>
      </Section>

      {/* Why context */}
      <Section className="py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Eyebrow>왜 맥락과 함께해야 하는가</Eyebrow>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            AI 추천 노출과 네이버 통합검색을 함께 관리합니다
          </h2>
          <p className="text-slate-500 max-w-2xl mb-10">
            AI에서 추천받은 병원도 환자는 네이버에서 진료 정보와 후기를 다시 확인합니다. 환자가
            추가로 살펴볼 검색 결과까지 함께 준비해야 합니다.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {whyContext.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-600/10 flex items-center justify-center">
                <Icon className="text-teal-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-8 bg-slate-900 text-white rounded-2xl p-6 flex items-start gap-4"
        >
          <ShieldCheck className="text-teal-400 shrink-0 mt-1" size={24} />
          <p className="text-sm sm:text-base leading-relaxed">
            AI와 네이버 검색을 모두 실행할 수 있는지 확인하십시오. 맥락은 홈페이지 정비와 보유
            채널 운영을 연결해 병원의 검색 노출을 돕겠습니다.
          </p>
        </motion.div>
      </Section>

      {/* Contact */}
      <Section id="contact" className="py-20 bg-slate-50">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
          <Eyebrow>무료 진단 신청</Eyebrow>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            우리 병원, 지금 AI에서 어떻게 보이는지 확인해 보세요
          </h2>
          <p className="text-slate-500 mb-10">
            주요 질문 몇 개로 현재 노출 상태를 무료로 확인해 드립니다.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-xl"
        >
          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle2 className="text-teal-500 mx-auto mb-4" size={40} />
              <p className="text-lg font-bold text-slate-900">신청이 접수되었습니다</p>
              <p className="text-sm text-slate-500 mt-2">
                입력해 주신 연락처로 담당자가 확인 후 연락드리겠습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">병원명</label>
                <input
                  required
                  name="clinic"
                  value={form.clinic}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="예: 맥락정형외과의원"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">담당자명</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="이름"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">연락처</label>
                <input
                  required
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">문의 내용</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="궁금하신 점을 남겨주세요 (선택)"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-full transition-colors"
              >
                무료 진단 신청하기
              </button>
            </form>
          )}
        </motion.div>
      </Section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 px-6 py-10">
        <div className="max-w-5xl mx-auto text-xs leading-relaxed space-y-2">
          <p>
            ¹ Capgemini, What Matters to Today's Consumer 2025. 해외 12개국 성인 12,000명 조사
            (2024.10~11). 상품·서비스 추천 응답률이며 병원 검색이나 국내 인구 추정치가 아닙니다.
          </p>
          <p>
            ² 오픈서베이 블로그, AI 검색 트렌드 리포트 2026 하반기. 국내 10~59세 검색 이용자
            1,000명(2026.07.02). 검색 대체율과는 다릅니다.
          </p>
          <p className="pt-4 border-t border-white/10 mt-4">© 맥락컨설팅. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

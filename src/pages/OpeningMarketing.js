import React, { useEffect, useMemo, useState } from 'react';
import {
  Globe,
  Share2,
  Smartphone,
  ClipboardList,
  Search,
  Megaphone,
  MessageSquare,
  Users,
  PartyPopper,
  CalendarClock,
  Crown,
  MapPin,
  TrendingUp,
  FileText,
  ArrowRight,
  CheckCircle2,
  Circle,
  XCircle,
  Download,
  RotateCcw,
} from 'lucide-react';

const STORAGE_KEY = 'mk_opening_checklist_v1';

const comparison = [
  {
    label: '다루는 범위',
    general: '입지 선정, 인테리어, 인허가, 의료장비, 자금 조달까지 모두',
    us: '개원 마케팅 하나',
  },
  {
    label: '마케팅의 비중',
    general: '여러 업무 중 하나로 곁들여짐',
    us: '유일한 전문 분야',
  },
  {
    label: '진행 방식',
    general: '다른 업무에 밀려 마케팅 착수가 늦어지기 쉬움',
    us: '개원 전부터 끝까지, 마케팅에만 집중된 실행',
  },
];

// 각 서비스 카드에 실행 체크리스트를 그대로 붙여서, "왜 필요한지"와
// "실제로 무엇을 하는지"를 한 카드 안에서 바로 확인할 수 있게 합니다.
const timeline = [
  {
    key: 'before',
    label: '개원 전',
    timing: 'D-60 ~ D-1',
    desc: '환자가 검색해도, 찾아와도 당황하지 않도록 기본기를 먼저 세팅합니다.',
    subStages: [
      {
        label: '기초 설계',
        timing: 'D-60 ~ D-45',
        services: [
          {
            id: 'plan',
            icon: Globe,
            title: '홈페이지 제작·유지보수',
            start: 'D-60부터',
            desc: '주력 시술·진료과목을 먼저 확정한 뒤 다국어 홈페이지를 제작하고, 개원 이후에도 콘텐츠와 기능을 지속적으로 관리합니다.',
            checklist: ['주력 시술·진료과목 확정', '홈페이지 제작 착수'],
          },
        ],
      },
      {
        label: '기반 구축',
        timing: 'D-44 ~ D-30',
        services: [
          {
            id: 'homepage',
            icon: Globe,
            title: '홈페이지 완성',
            start: 'D-44부터',
            desc: '다국어 홈페이지 제작을 완료하고, 진료과목·주력시술·시술후주의사항 페이지와 모바일 대응까지 마무리합니다.',
            checklist: [
              '다국어 홈페이지 제작 완료',
              '진료과목·주력시술 페이지 구성',
              '시술후주의사항 페이지 제작',
              '모바일 반응형 확인',
            ],
          },
          {
            id: 'brand',
            icon: Share2,
            title: '브랜드 채널 세팅',
            start: 'D-44부터',
            desc: '완성된 홈페이지를 기준으로 네이버 플레이스, 카카오맵, 블로그·SNS 등 병원의 첫인상이 되는 채널을 개설·최적화합니다.',
            checklist: [
              '네이버 플레이스 등록 및 정보 최적화',
              '카카오맵 병원 정보 등록',
              '인스타그램·블로그 채널 개설',
              '원장님 네이버 인물정보 등록',
            ],
          },
          {
            id: 'app',
            icon: Smartphone,
            title: '어플 세팅',
            start: 'D-44부터',
            desc: '예약, 상담, 리뷰 관리에 필요한 어플리케이션 환경을 구축합니다.',
            checklist: ['예약 어플 연동', '상담 챗봇·채널톡 세팅'],
          },
          {
            id: 'platform',
            icon: ClipboardList,
            title: '의료 플랫폼 입점',
            start: 'D-44부터',
            desc: '심사·승인 기간을 고려해 미리, 환자들이 많이 쓰는 리뷰·예약 플랫폼에 가입하고 병원 정보를 세팅합니다.',
            checklist: ['리뷰·예약 플랫폼(강남언니, 바비톡 등) 가입', '플랫폼별 병원 정보 세팅'],
          },
        ],
      },
      {
        label: '노출 준비',
        timing: 'D-29 ~ D-14',
        services: [
          {
            id: 'seo',
            icon: Search,
            title: '검색엔진 세팅',
            start: 'D-29부터',
            desc: '홈페이지 콘텐츠가 어느 정도 쌓인 뒤, 검색엔진이 홈페이지를 제대로 읽도록 기본 환경을 연동합니다.',
            checklist: ['구글 서치콘솔 등록', '네이버 서치어드바이저 등록'],
          },
          {
            id: 'ads',
            icon: Megaphone,
            title: '광고채널 세팅',
            start: 'D-29부터',
            desc: '네이버 등 병원 상황에 맞는 주요 검색광고 채널을 세팅합니다. 실제 집행은 개원 시점에 맞춰 조율합니다.',
            checklist: ['네이버 검색광고 계정 세팅', '광고 소재·키워드 초안 준비'],
          },
          {
            id: 'preopen',
            icon: MessageSquare,
            title: '개원 전 사전마케팅',
            start: 'D-29부터',
            desc: '오픈채팅방을 활용해 개원 전부터 잠재 환자와의 접점을 만들고 커뮤니티를 형성합니다.',
            checklist: ['오픈채팅방 개설', '사전 이벤트·혜택 안내 콘텐츠 준비', '자동 안내 메시지 세팅'],
          },
        ],
      },
      {
        label: '오픈 임박',
        timing: 'D-13 ~ D-1',
        services: [
          {
            id: 'trial',
            icon: Users,
            title: '체험단 프로그램 운영',
            start: 'D-13부터',
            desc: '오픈 시점에 맞춰 후기가 쌓이도록, 개원 임박 시점에 신규 환자 체험 기회를 제공합니다.',
            checklist: ['체험단 모집 공고', '체험 인원 확정 및 일정 조율'],
          },
          {
            id: 'eventprep',
            icon: PartyPopper,
            title: '오픈이벤트 준비',
            start: 'D-13부터',
            desc: '개원 당일 운영할 오픈 이벤트를 미리 기획하고, 홍보 콘텐츠와 전 채널 정보를 최종 점검합니다.',
            checklist: [
              '오픈 이벤트 기획 (할인·혜택)',
              '이벤트 홍보 콘텐츠 제작',
              '전 채널 정보 최종 일치 점검',
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'day',
    label: '개원 시점',
    timing: 'D-Day',
    desc: '병원을 알리고 첫 방문을 이끌어내는 순간입니다.',
    services: [
      {
        id: 'eventrun',
        icon: PartyPopper,
        title: '오픈이벤트',
        desc: '개원을 알리고 첫 방문을 이끄는 오픈 이벤트를 기획하고 운영합니다.',
        checklist: ['당일 운영 동선 점검', '오픈이벤트 운영'],
      },
    ],
  },
  {
    key: 'after',
    label: '개원 후',
    timing: 'D+1 ~',
    desc: '한 번의 방문을 재방문과 입소문으로 이어가는 꾸준한 운영이 필요합니다.',
    services: [
      {
        id: 'monthly',
        icon: CalendarClock,
        title: '월이벤트',
        desc: '매달 진행하는 이벤트로 재방문과 입소문을 꾸준히 만들어 갑니다.',
        checklist: ['매월 이벤트 주제 기획', '이벤트 안내 콘텐츠 배포'],
      },
      {
        id: 'flagship',
        icon: Crown,
        title: '주력상품마케팅',
        desc: '병원의 주력 시술·프로그램을 집중적으로 알리는 마케팅을 진행합니다.',
        checklist: ['집중 홍보 콘텐츠 제작', '주력 시술 운영 성과 점검'],
      },
      {
        id: 'community',
        icon: MapPin,
        title: '지역 커뮤니티 운영',
        desc: '맘카페 등 지역 커뮤니티에서 병원을 자연스럽게 알리고 소통합니다.',
        checklist: ['지역 맘카페 등 파악', '자연스러운 소통·노출 활동'],
      },
      {
        id: 'content',
        icon: TrendingUp,
        title: '콘텐츠 상위노출',
        desc: '핵심 진료과목·시술 키워드로 콘텐츠가 상위에 노출되도록 작업합니다.',
        checklist: ['핵심 키워드 선정', '블로그·카페 콘텐츠 상위노출 작업'],
      },
      {
        id: 'pr',
        icon: FileText,
        title: '홍보 콘텐츠 제작·배포',
        desc: '환자 경험 콘텐츠, 보도자료, 블로그 원고 등 다양한 홍보 콘텐츠를 제작하고 배포합니다.',
        checklist: ['환자 경험 콘텐츠 제작', '보도자료 배포', '블로그 원고 제작'],
      },
    ],
  },
];

// phase.subStages가 있으면 그 안의 services를, 없으면 phase.services를 모두 모아
// 평탄화합니다 (진행률 계산과 초기화에 사용).
const allServices = timeline.flatMap((phase) =>
  phase.subStages ? phase.subStages.flatMap((s) => s.services) : phase.services
);
const allItemIds = allServices.flatMap((service) =>
  service.checklist.map((_, ii) => `${service.id}-${ii}`)
);

const loadChecked = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

function ServiceCard({ service, checked, toggle }) {
  const Icon = service.icon;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex gap-4">
        <div className="shrink-0 w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center">
          <Icon className="text-teal-600" size={22} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900">{service.title}</h3>
            {service.start && (
              <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                {service.start}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{service.desc}</p>
        </div>
      </div>

      <ul className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
        {service.checklist.map((text, ii) => {
          const id = `${service.id}-${ii}`;
          const isChecked = !!checked[id];
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => toggle(id)}
                className="w-full flex items-start gap-2.5 text-left py-0.5 group"
              >
                {isChecked ? (
                  <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={16} />
                ) : (
                  <Circle className="text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5" size={16} />
                )}
                <span className={`text-sm ${isChecked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                  {text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function OpeningMarketing() {
  const [checked, setChecked] = useState(loadChecked);
  const [form, setForm] = useState({ clinic: '', name: '', phone: '', openDate: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch (e) {
      // ignore persistence failures
    }
  }, [checked]);

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const resetChecklist = () => setChecked({});

  const doneCount = useMemo(() => allItemIds.filter((id) => checked[id]).length, [checked]);
  const total = allItemIds.length;
  const percent = Math.round((doneCount / total) * 100);

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
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-white font-bold tracking-tight">맥락컨설팅</span>
          <div className="flex items-center gap-2">
            <a
              href={`${process.env.PUBLIC_URL}/files/opening-marketing-checklist.pdf`}
              download
              className="hidden sm:inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <Download size={14} /> PDF
            </a>
            <button
              onClick={scrollToContact}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              무료 상담 신청
            </button>
          </div>
        </div>
      </header>

      <section className="bg-slate-950 text-white px-6 pt-20 pb-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-wide text-teal-400 mb-3">개원을 준비하신다면</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-2xl">
            개원일은 하루, <br className="hidden sm:block" />
            마케팅은 그 전부터 시작됩니다
          </h1>
          <p className="mt-6 text-slate-300 max-w-xl text-lg leading-relaxed">
            다국어 홈페이지부터 오픈 이벤트, 개원 후 운영까지 — 서비스 설명과 실제 체크리스트를
            한 곳에서 바로 확인하며 준비해 드립니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={scrollToContact}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors"
            >
              무료 상담 신청하기 <ArrowRight size={18} />
            </button>
            <a
              href={`${process.env.PUBLIC_URL}/files/opening-marketing-checklist.pdf`}
              download
              className="border border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors"
            >
              <Download size={16} /> 체크리스트 PDF로 받기
            </a>
          </div>

          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-5 max-w-xl">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-300">아래 체크리스트 진행 현황</span>
              <span className="font-semibold text-teal-400">
                {doneCount} / {total} 완료 ({percent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-wide text-teal-600 mb-3">왜 맥락인가</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            개원컨설팅엔 마케팅이 '일부'지만, 저희에겐 마케팅이 '전부'입니다
          </h2>
          <p className="text-slate-500 max-w-2xl mb-8 leading-relaxed">
            일반적인 개원컨설팅은 입지·인테리어·인허가·장비·자금까지 함께 다루면서 마케팅은
            여러 업무 중 하나로 곁들여집니다. 맥락컨설팅은 개원 마케팅 하나만 전문으로 하는
            집단입니다. 성과는 결국 마케팅에만 집중하는 전문가와 일할 때 납니다.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm border border-slate-200 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left font-semibold px-5 py-3 w-32">구분</th>
                  <th className="text-left font-semibold px-5 py-3">일반 개원컨설팅</th>
                  <th className="text-left font-semibold px-5 py-3">맥락컨설팅</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-5 py-4 border-t border-slate-200 font-semibold text-slate-800">
                      {row.label}
                    </td>
                    <td className="px-5 py-4 border-t border-slate-200 text-slate-500">
                      <span className="inline-flex items-start gap-2">
                        <XCircle className="text-slate-300 shrink-0 mt-0.5" size={16} />
                        {row.general}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-t border-slate-200 text-slate-800 font-medium">
                      <span className="inline-flex items-start gap-2">
                        <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={16} />
                        {row.us}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {timeline.map((phase, pi) => (
        <section key={phase.key} className={pi % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{phase.label}</h2>
              <span className="text-sm font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                {phase.timing}
              </span>
            </div>
            <p className="text-slate-500 mb-8">{phase.desc}</p>

            {phase.subStages ? (
              <div className="space-y-8">
                {phase.subStages.map((sub) => (
                  <div key={sub.label} className="border-l-2 border-teal-100 pl-4">
                    <div className="flex items-baseline gap-2 mb-4">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                        {sub.label}
                      </h3>
                      <span className="text-xs font-mono text-slate-400">{sub.timing}</span>
                    </div>
                    <div
                      className={sub.services.length === 1 ? 'max-w-2xl' : 'grid sm:grid-cols-2 gap-5'}
                    >
                      {sub.services.map((service) => (
                        <ServiceCard key={service.id} service={service} checked={checked} toggle={toggle} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={phase.services.length === 1 ? 'max-w-2xl' : 'grid sm:grid-cols-2 gap-5'}>
                {phase.services.map((service) => (
                  <ServiceCard key={service.id} service={service} checked={checked} toggle={toggle} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      <div className="max-w-5xl mx-auto px-6 -mt-8 mb-8">
        <button
          type="button"
          onClick={resetChecklist}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <RotateCcw size={14} /> 체크 초기화
        </button>
      </div>

      <section id="contact" className="py-20 bg-slate-950 px-6 text-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-wide text-teal-400 mb-3">무료 상담 신청</p>
          <h2 className="text-3xl font-bold mb-2">개원 준비, 어디서부터 시작할지 함께 정리해 드립니다</h2>
          <p className="text-slate-400 mb-10">
            병원 정보와 개원 예정일을 남겨주시면 담당자가 확인 후 연락드립니다.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-xl text-slate-800">
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
                    placeholder="예: 맥락정형외과의원 (개원 예정)"
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">개원 예정일</label>
                  <input
                    name="openDate"
                    value={form.openDate}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="예: 2027년 3월 (선택)"
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
                  무료 상담 신청하기
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 px-6 py-10">
        <div className="max-w-5xl mx-auto text-xs">
          <p>© 맥락컨설팅. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

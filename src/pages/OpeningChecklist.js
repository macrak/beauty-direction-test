import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, Download, RotateCcw } from 'lucide-react';

const emptyInquiry = { clinic: '', phone: '' };

const STORAGE_KEY = 'mk_opening_checklist_v1';

const phases = [
  {
    key: 'before',
    label: '개원 전',
    timing: 'D-60 ~ D-1',
    subStages: [
      {
        label: '기초 설계',
        timing: 'D-60 ~ D-45',
        groups: [
          {
            id: 'plan',
            title: '사전 기획',
            items: ['주력 시술·진료과목 확정', '홈페이지 제작 착수'],
          },
        ],
      },
      {
        label: '기반 구축',
        timing: 'D-44 ~ D-30',
        groups: [
          {
            id: 'homepage',
            title: '홈페이지',
            items: [
              '다국어 홈페이지 제작 완료',
              '진료과목·주력시술 페이지 구성',
              '시술후주의사항 페이지 제작',
              '모바일 반응형 확인',
            ],
          },
          {
            id: 'brand',
            title: '브랜드 채널',
            items: [
              '네이버 플레이스 등록 및 정보 최적화',
              '카카오맵 병원 정보 등록',
              '인스타그램·블로그 채널 개설',
              '원장님 네이버 인물정보 등록',
            ],
          },
          {
            id: 'app',
            title: '어플·예약 세팅',
            items: ['예약 어플 연동', '상담 챗봇·채널톡 세팅'],
          },
          {
            id: 'platform',
            title: '의료 플랫폼 입점',
            items: ['리뷰·예약 플랫폼(강남언니, 바비톡 등) 가입', '플랫폼별 병원 정보 세팅'],
          },
        ],
      },
      {
        label: '노출 준비',
        timing: 'D-29 ~ D-14',
        groups: [
          {
            id: 'seo',
            title: '검색엔진 세팅',
            items: ['구글 서치콘솔 등록', '네이버 서치어드바이저 등록'],
          },
          {
            id: 'ads',
            title: '광고채널 세팅',
            items: ['네이버 검색광고 계정 세팅', '광고 소재·키워드 초안 준비'],
          },
          {
            id: 'preopen',
            title: '사전마케팅 (오픈채팅방)',
            items: ['오픈채팅방 개설', '사전 이벤트·혜택 안내 콘텐츠 준비', '자동 안내 메시지 세팅'],
          },
        ],
      },
      {
        label: '오픈 임박',
        timing: 'D-13 ~ D-1',
        groups: [
          {
            id: 'trial',
            title: '체험단 프로그램',
            items: ['체험단 모집 공고', '체험 인원 확정 및 일정 조율'],
          },
          {
            id: 'eventprep',
            title: '오픈이벤트 준비',
            items: [
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
    groups: [
      {
        id: 'eventrun',
        title: '오픈이벤트',
        items: ['당일 운영 동선 점검', '오픈이벤트 운영'],
      },
    ],
  },
  {
    key: 'after',
    label: '개원 후',
    timing: 'D+1 ~',
    groups: [
      {
        id: 'monthly',
        title: '월이벤트',
        items: ['매월 이벤트 주제 기획', '이벤트 안내 콘텐츠 배포'],
      },
      {
        id: 'flagship',
        title: '주력상품마케팅',
        items: ['집중 홍보 콘텐츠 제작', '주력 시술 운영 성과 점검'],
      },
      {
        id: 'community',
        title: '지역 커뮤니티 운영',
        items: ['지역 맘카페 등 파악', '자연스러운 소통·노출 활동'],
      },
      {
        id: 'content',
        title: '콘텐츠 상위노출',
        items: ['핵심 키워드 선정', '블로그·카페 콘텐츠 상위노출 작업'],
      },
      {
        id: 'pr',
        title: '홍보 콘텐츠 제작·배포',
        items: ['환자 경험 콘텐츠 제작', '보도자료 배포', '블로그 원고 제작'],
      },
    ],
  },
];

const groupsOf = (phase) =>
  phase.subStages ? phase.subStages.flatMap((s) => s.groups) : phase.groups;

const allItemIds = phases.flatMap((phase) =>
  groupsOf(phase).flatMap((group) => group.items.map((_, ii) => `${group.id}-${ii}`))
);

const loadChecked = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

function GroupCard({ group, phaseKey, checked, toggle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-900 mb-3">{group.title}</h3>
      <ul className="space-y-2">
        {group.items.map((item, ii) => {
          const id = `${group.id}-${ii}`;
          const isChecked = !!checked[id];
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => toggle(id)}
                className="w-full flex items-start gap-3 text-left py-1.5 group"
              >
                {isChecked ? (
                  <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={20} />
                ) : (
                  <Circle className="text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5" size={20} />
                )}
                <span className={isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}>
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function OpeningChecklist() {
  const [checked, setChecked] = useState(loadChecked);
  const [inquiry, setInquiry] = useState(emptyInquiry);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch (e) {
      // ignore persistence failures
    }
  }, [checked]);

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const reset = () => setChecked({});

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    setInquiry((prev) => ({ ...prev, [name]: value }));
  };
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const doneCount = useMemo(
    () => allItemIds.filter((id) => checked[id]).length,
    [checked]
  );
  const total = allItemIds.length;
  const percent = Math.round((doneCount / total) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-white font-bold tracking-tight">맥락컨설팅</span>
          <a
            href={`${process.env.PUBLIC_URL}/files/opening-marketing-checklist.pdf`}
            download
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 transition-colors"
          >
            <Download size={16} /> PDF 다운로드
          </a>
        </div>
      </header>

      <section className="bg-slate-950 text-white px-6 pt-16 pb-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-wide text-teal-400 mb-3">무료 체크리스트</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight max-w-xl">
            개원 마케팅, 빠뜨리는 것 없이 준비하세요
          </h1>
          <p className="mt-5 text-slate-300 max-w-xl leading-relaxed">
            개원 전부터 개원 후 운영까지, 맥락컨설팅이 실제로 진행하는 마케팅 항목을 실행
            순서대로 정리했습니다. 하나씩 체크하며 준비 상태를 점검해 보세요.
          </p>

          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-300">진행 현황</span>
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

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-14">
        {phases.map((phase) => (
          <section key={phase.key}>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{phase.label}</h2>
              <span className="text-sm font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                {phase.timing}
              </span>
            </div>

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
                    <div className="space-y-5">
                      {sub.groups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          phaseKey={phase.key}
                          checked={checked}
                          toggle={toggle}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {phase.groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    phaseKey={phase.key}
                    checked={checked}
                    toggle={toggle}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <RotateCcw size={14} /> 체크 초기화
        </button>
      </main>

      <section className="bg-slate-950 text-white px-6 py-14">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">
            체크리스트대로 혼자 다 준비하기 버거우시다면
          </h2>
          <p className="text-slate-300 leading-relaxed">
            맥락컨설팅이 개원 전 세팅부터 개원 후 운영까지 함께합니다.
            병원명과 연락처를 남겨주시면 먼저 연락드리겠습니다.
          </p>

          {submitted ? (
            <div className="mt-7 bg-white/5 border border-white/10 rounded-2xl p-6">
              <CheckCircle2 className="text-teal-400 mx-auto mb-3" size={32} />
              <p className="font-semibold">신청이 접수되었습니다</p>
              <p className="text-sm text-slate-400 mt-1">담당자가 확인 후 연락드리겠습니다.</p>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="mt-7 space-y-3 text-left">
              <input
                required
                name="clinic"
                value={inquiry.clinic}
                onChange={handleInquiryChange}
                placeholder="병원명 (또는 개원 예정 병원명)"
                className="w-full rounded-lg px-4 py-2.5 bg-white/10 border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                required
                name="phone"
                value={inquiry.phone}
                onChange={handleInquiryChange}
                placeholder="연락처 (010-0000-0000)"
                className="w-full rounded-lg px-4 py-2.5 bg-white/10 border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-full transition-colors"
              >
                무료 상담 신청하기
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

# SOOL RESERVE — claude.ai 라이브 버전

Next.js 앱과 같은 화면·로직을 단일 HTML로 옮긴 버전입니다. 데이터는 claude.ai 아티팩트 저장소에 있습니다.

- 카탈로그(공개): `cat/v1`(설정), `cat/v1/{products,breweries,articles,notices}` — 읽기: 모든 방문자 / 쓰기: 소유자·Editor
- 운영(관리자 전용): `ops/v1/{products,breweries}`(수수료·매입가·공급처·평가 점수·서류), `ops/v1/{orders,suppliers,pos,audit}` — 읽기·쓰기: 소유자·Editor만
  - 상품·양조장 저장 시 `writeProduct`/`writeBrewery`가 공개/내부 필드를 자동 분리 (`INTERNAL_P`, `INTERNAL_B` in app5.js)
- 판매(app5.js): 운영 모드 `PRIVATE_TEST`에서만 관리자에게 장바구니·결제(Mock 성인 인증 30분·Mock 결제)·주문/배송/취소·정산·공급처·발주/입고가 열림. LIVE 전환은 막혀 있음
- 문의: `inq/<viewer id>` — 각자 자기 문서만 작성, 소유자·Editor만 전체 열람
- 빌드: `python3 build.py` → `index.html`(게시용), `test.html`(로컬 테스트용 모의 저장소 포함)
- `art.json`: `src/components/BreweryVisual.tsx`, `BottleArt.tsx`를 서버 렌더링해 추출한 일러스트

# SOOL RESERVE — claude.ai 라이브 버전

Next.js 앱과 같은 화면·로직을 단일 HTML로 옮긴 버전입니다. 데이터는 claude.ai 아티팩트 저장소에 있습니다.

- 카탈로그: `cat/v1`(설정), `cat/v1/{products,breweries,articles,notices,audit}` — 읽기: 모든 방문자 / 쓰기: 소유자·Editor
- 문의: `inq/<viewer id>` — 각자 자기 문서만 작성, 소유자·Editor만 전체 열람
- 빌드: `python3 build.py` → `index.html`(게시용), `test.html`(로컬 테스트용 모의 저장소 포함)
- `art.json`: `src/components/BreweryVisual.tsx`, `BottleArt.tsx`를 서버 렌더링해 추출한 일러스트

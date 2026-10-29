# 공동 디자인 규칙

## 브랜드 컬러 (2026-09-03 개편)

명함 디자인(테라코타 블록 + 화이트/블랙) 기준으로 사이트 전체 키컬러를 블루 → 테라코타로 교체.

| 토큰 | 값 | 용도 |
|------|-----|------|
| Primary | `#C1452D` | 기본 브랜드 컬러 (버튼, 아이콘, 강조 텍스트, 로고 dark variant) |
| Primary Bright | `#D65A3B` | 히어로처럼 어두운 배경 위 CTA 버튼 |
| Primary Bright Hover | `#B84A2E` | 위 버튼의 hover 상태 |
| Primary Dark (hover) | `#A23A24` | 기본 버튼 hover, 강조 텍스트 hover |
| Primary Tint | `#FBEEE8` | 옅은 배경 강조 (섹션 배경, 아이콘 원형 배경) |

- `globals.css`의 `--primary` / `--ring` CSS 변수(HSL `10 62% 47%`)로도 등록되어 있어 `bg-primary`, `text-primary` 등 Tailwind 유틸리티가 자동으로 새 컬러를 따른다.
- 로고(`Logo.tsx`)는 CSS 필터 대신 실제 컬러가 적용된 SVG 두 벌(`cb-logo.svg`=흰색, `cb-logo-terracotta.svg`=`#C1452D`)을 `variant`에 따라 교체한다.
- 새 브랜드 컬러를 쓰는 곳을 늘릴 때는 위 표의 토큰만 사용하고 임의의 새 블루/오렌지 값을 추가하지 않는다.

## 메인 페이지 "클리닉 그로스 컴퍼니" 개편 (2026-10-29, 브랜치 `feat/clinic-growth-renewal`)

원칙: **히어로에만 고품질 모션 효과, 나머지 섹션은 정적이고 전문적인 에이전시 그리드.**
레퍼런스: BAT(batcrew.co.kr), Skiper UI 메인, Unicorn Studio, Originkit, React Bits, Magic UI, Aceternity UI, 21st.dev.

### 금지 (AI 템플릿 느낌을 만드는 요소)

- 섹션 배경 글로우, 블러 원형 레이어, 장식용 그라데이션 카드
- 알약형 칩(pill) 나열, 아이콘을 원형 배경에 담은 장식, 이모지
- 스크롤할 때마다 튀어나오는 등장 애니메이션, 카운트업 숫자, 텍스트 마키
- 강조색 남용: 테라코타는 CTA와 1곳 이하의 포인트에만 사용

### 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| Ink | `#0A0A0A` | 히어로, 최종 CTA 배경, 본문 제목 |
| Paper | `#FFFFFF` / `#F6F5F2` | 기본 섹션 / 교차 섹션 배경 |
| Line | `black/10` (다크: `white/15`) | 1px 구분선, 표, 그리드 |
| Muted | `gray-500` | 라벨, 보조 설명 |
| Accent | `#C1452D` (다크 위 `#D65A3B`) | CTA, 차트의 최신 실적 포인트 |

### 레이아웃과 타이포

| 유형 | 규칙 |
|------|------|
| 섹션 헤더 | `SectionHeader`: 상단 1px 라인, 좌측 3칸 `(01) Label`, 우측 9칸 제목 `text-4xl~6xl font-semibold tracking-[-0.03em]` |
| 숫자 | KPI는 카드 없이 세로 구분선으로 나눈 열, `tabular-nums` |
| 목록 | 번호(01, 02) + 1px 행 구분선. 체크 아이콘, 칩 사용하지 않음 |
| 로고 | 1px 라인 그리드, 흑백 고정 (호버 시에만 컬러) |
| 모션 | 히어로 외 섹션은 등장 애니메이션 없음. 차트 호버 툴팁, 대시보드 탭처럼 사용자가 직접 조작하는 인터랙션만 허용 |

### 히어로

| 요소 | 규칙 |
|------|------|
| 배경 | `ShaderBackground`: WebGL 프래그먼트 셰이더(도메인 워핑 실크 패턴 + 그레인). 좌측은 어둡게 눌러 텍스트 가독성 확보, 포인터 위치에 은은한 광원 |
| 메시지 | 좌측 정렬. 시장명은 글자 단위 롤링(Skiper UI 키네틱 타이포 참고) |
| 하단 정보행 | 1px 라인 위 3열: 시장 인덱스 / 소개 문장 / CTA |
| 헤더 | 메인에서 히어로 위에 있을 때만 다크, 히어로를 지나면 기본 화이트 |
| 접근성 | `prefers-reduced-motion` 이면 셰이더 정지 프레임, 시장 자동 순환 정지. WebGL 미지원 시 단색 배경 |

- 컴포넌트 위치: `src/components/sections/growth/`
- 데이터: `src/data/growthMetrics.ts`(차트, KPI), `src/data/team.ts`(팀), `src/data/partners.ts`(로고), `src/data/markets.ts`(타깃 시장)

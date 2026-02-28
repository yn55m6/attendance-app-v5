# 🚀 React 마이그레이션 계획서 (Migration Plan)

## 1. 개요 (Overview)
- **목표:** 단일 HTML 파일(`index.html`)로 구성된 현재 프로젝트를 **React** 기반의 모던 웹 애플리케이션으로 전환.
- **이유:** 유지보수성 향상, 컴포넌트 재사용성 증대, 사용자 경험(UX) 개선, 그리고 향후 기능 확장의 용이성 확보.
- **대상:** '몸펴기생활운동 연신내 출석부' 웹 애플리케이션.
- **전략:** 기존 코드는 레거시로 보존하고, **새로운 리포지토리**에서 React 프로젝트를 처음부터 구축(Greenfield Project)합니다.

## 2. 기술 스택 선정 (Tech Stack)
| 구분 | 기술 | 선정 이유 |
|---|---|---|
| **Framework** | **React 18** | 컴포넌트 기반 UI 구축의 표준. |
| **Build Tool** | **Vite** | 빠르고 가벼운 개발 환경 제공 (CRA 대비 우수). |
| **Language** | **TypeScript** | 정적 타입 검사를 통한 코드 안정성 및 유지보수성 확보. |
| **Styling** | **Tailwind CSS** | 기존 스타일을 그대로 유지하며 빠르게 UI 구현 가능. |
| **State Mgmt** | **Context API** | 소규모 프로젝트에 적합한 내장 상태 관리 도구 (Redux 불필요). |
| **Backend** | **Firebase** | 기존 DB(Firestore) 및 인증 유지. |
| **Routing** | **React Router** | SPA(Single Page Application) 라우팅 처리. |
| **Charts** | **Chart.js** | 기존 그래프 라이브러리 유지 (`react-chartjs-2` 래퍼 사용). |

## 3. 프로젝트 구조 설계 (Project Structure)
```text
src/
├── assets/          # 이미지, 폰트 등 정적 파일
├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── common/      # 버튼, 입력창, 모달 등 공통 컴포넌트
│   ├── layout/      # 헤더, 네비게이션 바 등 레이아웃
│   └── features/    # 기능별 컴포넌트 (출석, 리포트 등)
├── context/         # 전역 상태 관리 (AuthContext, DataContext)
├── hooks/           # 커스텀 훅 (useFirestore, useAuth 등)
├── pages/           # 라우트 페이지 (Home, Members, Reports, Login)
├── services/        # Firebase API 호출 로직 분리
├── utils/           # 날짜 포맷팅, 헬퍼 함수 등
├── App.tsx          # 메인 앱 컴포넌트 & 라우팅 설정
└── main.tsx         # 진입점
```

## 4. 단계별 전환 절차 (Step-by-Step Migration)

### Phase 1: 환경 설정 및 기본 구조 잡기
1.  Vite + React + TypeScript 프로젝트 생성.
2.  Tailwind CSS 설치 및 설정 (`tailwind.config.js`).
3.  Firebase SDK 설치 및 환경 변수(`.env`) 설정.
4.  기본 폴더 구조 생성.

### Phase 2: 공통 컴포넌트 및 레이아웃 구현
1.  **Layout:** Header, Bottom Navigation Bar 컴포넌트화.
2.  **UI Components:** Button, Card, Modal, Input 등 기본 UI 요소 분리.
3.  **Routing:** React Router 설치 및 페이지 라우팅 설정 (`/`, `/members`, `/reports`, `/login`).

### Phase 3: 핵심 기능 이식 (Logic Migration)
1.  **Auth:** 관리자 로그인 기능 구현 (Context API 활용).
2.  **Members:** 회원 목록 조회, 추가, 삭제 기능 구현.
3.  **Attendance:** 
    - QR 코드 생성 및 스캔 로직 이식.
    - 출석 체크 모달 및 로직(직접 입력/선택) 구현.
    - 종이 명부 일괄 입력 기능 구현.
4.  **Reports:** Chart.js 연동 및 통계 리포트 페이지 구현.

### Phase 4: 데이터 연동 및 최적화
1.  기존 `index.html`의 Firebase 로직을 `services/firebase.ts`로 분리.
2.  실시간 동기화(`onSnapshot`) 로직을 Custom Hook(`useAttendanceData`)으로 변환.
3.  성능 최적화 (Memoization, Code Splitting).

### Phase 5: 테스트 및 배포
1.  기능 테스트 및 버그 수정.
2.  Vercel 또는 Firebase Hosting을 통한 배포.
3.  기존 사용자에게 새 URL 안내 (필요 시).

## 5. 데이터 마이그레이션 (Data Migration)
- **전략:** 기존 Firebase Firestore를 그대로 사용하므로 **별도의 데이터 이관 작업은 불필요**합니다.
- **주의:** 새 프로젝트의 `.env` 파일에 기존 `firebaseConfig` 값을 정확히 입력해야 합니다.

## 6. 주요 변경 포인트 (Key Changes)

| 기존 (Vanilla JS) | 변경 후 (React) |
|---|---|
| `window.onload`, `onclick` | `useEffect`, `onClick` 이벤트 핸들러 |
| `document.getElementById` | `useRef` 또는 State 기반 렌더링 |
| 전역 변수 (`members`, `logs`) | Context API 또는 Custom Hook 상태 |
| `innerHTML` 문자열 조합 | JSX 컴포넌트 렌더링 |
| 단일 파일 (`index.html`) | 모듈화된 컴포넌트 파일 (`.tsx`) |


---
**작성일:** 2024-05-21
**작성자:** Gemini Code Assist
```

### Git Commit

아래 명령어를 사용하여 변경사항을 Git에 반영하세요.

```bash
# 1. 변경된 모든 파일을 스테이징합니다.
git add .

# 2. 커밋 메시지와 함께 변경사항을 기록합니다.
git commit -m "docs: React 전환을 위한 MIGRATION.md 계획서 작성"

# 3. 원격 저장소에 변경사항을 푸시합니다.
git push
```

<!--
[PROMPT_SUGGESTION]MIGRATION.md 계획에 따라 Vite + React 프로젝트를 생성하고 초기 설정을 진행해 주세요.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]기존 index.html의 스타일을 Tailwind CSS 설정 파일(tailwind.config.js)로 옮기는 방법을 알려주세요.[/PROMPT_SUGGESTION]
-->
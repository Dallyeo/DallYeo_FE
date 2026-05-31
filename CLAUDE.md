# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

This is the frontend repository for **달여(Dallyeo)**. As of writing it is a **greenfield project** — there is no source code, no `package.json`, no build tooling, and no chosen framework yet. The repository contains only this guide, `README.md`, `.gitignore` (pre-seeded for multiple JS frameworks), and the AIDLC rule set.

Do not invent build/test/lint commands. Until tooling lands, ask the user before assuming any framework, package manager, or directory layout.

## Governing Workflow: AWS AIDLC

All software-development requests in this repository are governed by the **AWS AI-Driven Development Lifecycle (AIDLC) workflow**. This OVERRIDES any built-in default workflow.

**Before doing any development work**, load and follow:

- Core workflow: `aidlc-rules/aws-aidlc-rules/core-workflow.md`
- Rule details (referenced by the core workflow): `.aidlc-rule-details/`
- Rule-set version pin: `aidlc-rules/VERSION`

The core workflow lists candidate rule-details paths and tells you to use the first one that exists. In this repo that resolved path is `.aidlc-rule-details/` (the standard Claude Code location). All `common/...`, `inception/...`, `construction/...`, `operations/...`, and `extensions/...` references in the core workflow are relative to this directory (e.g. `.aidlc-rule-details/common/process-overview.md`).

At workflow start the core workflow requires you to:

1. Display the welcome message from `common/welcome-message.md` (once per workflow).
2. Load `common/process-overview.md`, `common/session-continuity.md`, `common/content-validation.md`, `common/question-format-guide.md`.
3. Scan `extensions/*/` for `*.opt-in.md` files only (defer loading full extension rules until the user opts in).
4. Log the user's raw request in `aidlc-docs/audit.md` and run **Workspace Detection** (`inception/workspace-detection.md`) first.

## Phase Structure (Summary)

The workflow is adaptive — only stages that add value execute. Full rules live in the rule-details files; this is just a map.

- **🔵 Inception**: Workspace Detection → Reverse Engineering (brownfield only) → Requirements Analysis → User Stories (conditional) → Workflow Planning → Application Design (conditional) → Units Generation (conditional).
- **🟢 Construction**: Per-unit loop of Functional Design → NFR Requirements → NFR Design → Infrastructure Design → Code Generation, then Build and Test.
- **🟡 Operations**: Placeholder.

Every stage requires explicit user approval before proceeding and a raw-input audit entry in `aidlc-docs/audit.md`.

## Hard Constraints from the Workflow

- **Audit log**: `aidlc-docs/audit.md` must be **appended/edited**, never overwritten. Log every user input verbatim with ISO 8601 timestamps.
- **Plan checkboxes**: When executing a plan file, mark each step `[x]` in the **same interaction** that completes it.
- **Content validation**: Validate Mermaid and ASCII diagrams per `common/content-validation.md` and `common/ascii-diagram-standards.md` **before** writing any file.
- **Question format**: When asking questions, follow `common/question-format-guide.md` (multiple-choice A–E with `[Answer]:` tags).
- **No emergent menus**: Construction stages use the standardized 2-option completion message ("Request Changes" / "Continue to Next Stage") defined in each stage's rule file — do not invent 3-option menus.
- **Code vs. docs**: Application code goes at the workspace root. Everything under `aidlc-docs/` is documentation only.


---

# Project Context — 달여(DallYeo) Frontend (Web View Layer)

> NOTE: This section is appended BELOW the AI-DLC core workflow. The workflow above
> governs HOW we work; this section defines WHAT we build and the standing technical
> constraints. Both apply every session. Do not delete the AI-DLC workflow above.

## Output language (strict)
- ALL artifacts, docs, user stories, plans, questions, UI copy/labels, and code comments → Korean (한국어).
- Code identifiers (vars/functions/types/files) → English. This file is in English; everything you PRODUCE is in Korean.

## What this codebase is
- Shared web SPA rendered inside the native iOS/Android WebView. It is the PRIMARY UI host: it owns the main view, the bottom tab bar, onboarding, login, records, achievements, settings, and the post-run result screen.
- Native owns interactive maps, GPS, search, route editing, and live run tracking. The web LAUNCHES native flows via the bridge and consumes their results/events.
- All data comes from OUR backend over HTTP. Public/TourAPI data is proxied by the backend — the web NEVER calls public APIs directly.

## Scope — views owned by this web layer
Source of truth: `docs/기능명세서.md`.
- Login (social) — 로그인 유도
- V01 온보딩
- V02 메인뷰 (home hub + 추천 코스 + 지역 선택; default region 군산)
- 하단 탭바 (모든 메인 화면 공통): **메인(검색 진입점) / 기록 / 마이페이지(=설정)**. 업적은 탭바에서 제외 (V14는 MVP3 + 기획 보류).
- V10 완주결과뷰 (rendered from the native 'runCompleted' event)
- V11 기록뷰 (list/detail = build now; 기간 통계 + 막대그래프 = MVP3 → define data model now, defer UI)
- V12 기록상세뷰
- V13 설정뷰 (= My Page)
- V14 업적뷰 (planning on hold → placeholder + data model only)

NOT in this layer (native owns; never implement here): V03 지도, V04 검색, V05 검색결과, V06 위치정보, V07 경로수정, V08 코스확인, V09 코스진행, and ALL live map rendering / GPS / location services.

## Architecture (lightweight — principles, not full ceremony)
- Feature-Sliced Design (lite): group by feature, not by file type.
- Repository pattern over the two data sources, so UI/hooks depend on an interface — never on "backend vs bridge vs mock".
- Dependency direction: presentation → application(hooks) → domain ← data. Domain depends on nothing.
- Define domain types FIRST; they are the contract with the backend + native teams.
- Strictly separate business logic from presentation (restyle later = swap presentation only).
- Do NOT over-engineer: no DTO↔domain mappers everywhere, no use-case-class-per-action.

Folder structure:
    src/
      app/        # shell, routing, providers, bottom tab bar
      features/   # onboarding · login · main · runResult · records · recordDetail · achievements · settings
                  #   each feature: ui/ (presentation) · model/ (hooks/state) · api/ (repository calls)
      domain/     # shared domain types + pure logic
      shared/     # api client, bridge adapter, design tokens, ui kit, utils, mocks

## Tech stack
- React + TypeScript + Vite (SPA, no SSR).
- Tailwind CSS. Design is wireframe-only → LO-FI FIRST: all color/typography/spacing/radius live in design tokens (Tailwind theme + CSS variables); real design later = edit tokens only.
- Runs inside WKWebView + Android WebView: handle safe-area insets (env(safe-area-inset-*) + viewport-fit=cover); use 100dvh, NOT 100vh; disable overscroll bounce / long-press callout / tap-highlight; tame soft-keyboard insets so the fixed tab bar doesn't jump.

## Native ↔ Web bridge (window.DallYeoBridge)
- Single abstraction `window.DallYeoBridge`; each platform injects its own adapter (iOS WKScriptMessageHandler, Android @JavascriptInterface). Web code never touches platform APIs directly.
- Async pattern: postMessage is one-way, so all calls resolve via a request-id + promise-registry. Provide a MOCK bridge for browser-only dev that mimics the async behavior.
- Web→native: login(provider:'kakao'|'apple'|'google'):Promise<AppSession>; logout():Promise<void>; openCourseSearch():void; openCourseConfirm(course):void; startRun(course):void; getPermissionStatus(type:'location'|'notification'):Promise<PermissionStatus>; requestPermission(type):Promise<PermissionStatus>; openOSSettings():void; pickProfilePhoto():Promise<string>; share(payload:SharePayload):void; openExternalUrl(url:string):void.
- Native→web events via DallYeoBridge.on(event, handler):Unsubscribe — 'runCompleted'→RunResult (route polyline + STATIC map image URL + 거리/시간/페이스/칼로리/완주율); 'runCancelled'; 'permissionChanged'; 'sessionChanged'.
- ABSOLUTE RULE: never perform an OAuth handshake inside the WebView. The login screen renders buttons only and calls bridge.login(); native performs the handshake. (Google blocks embedded-WebView OAuth via disallowed_useragent.)

## Data layer
- Backend = primary data source. Build ONE typed API client (REST assumed; base URL configurable; sends the session token as a Bearer header). Endpoints + request/response TS types are finalized during Inception; mock with MSW (Mock Service Worker) until the real backend lands.
- Bridge = auth handshake + native-screen launches + device APIs + events ONLY (not content data).
- Mock BOTH (MSW for backend, JS mock for bridge): every view must be fully previewable in a plain browser with no device and no backend.

## Standing decisions (defaults — change the line if needed)
- Web delivery: LOCAL bundle shipped inside the app — fast, offline-capable, reliable for judging. Revisit remote-URL / OTA after launch if web-only updates are wanted.
- Session token: NATIVE is the single source of truth. Native does OAuth → exchanges with backend for an app session token → stores it securely (Keychain / Keystore) → injects it to web via the bridge. Web uses it as a Bearer header and does NOT persist it in localStorage. Native fires 'sessionChanged' on login/logout/expiry; logout in web settings clears the native session through the bridge.
- Auth gating: 기록(V11)/업적(V14)/설정 프로필(V13) require login → non-logged-in is blocked + shown a login prompt. V10 when not logged in → do NOT save the run; on "메인 화면" exit show the login-confirm popup (exact copy in spec) and save only after login.

## Cross-cutting rules (exact copy/numbers in docs/기능명세서.md)
- iOS back = left-edge swipe — the web must NOT trap horizontal swipe gestures or hijack history in a way that breaks it. Bottom sheets/modals must close on back (manage them as history entries).
- V01: location-permission step via bridge; body info (키/체중/성별) skippable; validate 키 ≤ 3 digits, 체중 2–3 digits; "입력 완료" disabled until all three filled.
- V02: 추천 코스 i-버튼 popup shows description + a STATIC route preview (image, not a live map SDK); 코스 만들기 → bridge.openCourseSearch(); 추천 코스 카드 → bridge.openCourseConfirm(course); region default 군산.
- V10: render from the 'runCompleted' payload; completion-rate message uses the exact 3 strings in the spec; STATIC route map (no zoom); nearby-places list (500m, 편의시설/음식점 segments) from backend.
- V12: route map is STATIC (no zoom) from a backend-provided static map image.
- V14: the 전라북도 map is a stylized SVG gamification component, NOT a real map SDK.
- Implement Empty/error states wherever the spec lists 예외처리.

## How we work (AI-DLC)
- Kick off with "Using AI-DLC, ..." naming the target view(s). The workflow above runs Inception → Construction with human approval gates; artifacts land in aidlc-docs/ (in Korean).
- Construction order: types → backend API client + MSW mocks → bridge interface + mock bridge → app shell/routing/tab bar → lo-fi views. Priority: Login & V01 & V02 → V10 → V11/V12/V13 → V14 placeholder. Approve each stage.
- Debug: WKWebView via Safari Web Inspector (set isInspectable = true on iOS 16.4+); Android WebView via chrome://inspect.

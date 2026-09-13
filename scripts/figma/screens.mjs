// 웹 레이어가 소유하는 화면 레지스트리.
//
// ⚠️ **반드시 `HiFi` 페이지의 프레임만 등록할 것.**
// 작업용 페이지(예: "페퍼의 음침한 공간")에도 이름이 비슷한 프레임이 잔뜩 있고
// node-id는 그쪽이 더 높은(=최신처럼 보이는) 경우가 많다. **node-id로 최신본을 고르면 틀린다.**
// `spec.mjs`가 실행 시 소속 페이지를 검증해 HiFi가 아니면 경고한다.
//
// V03~V09는 네이티브 소유 → 제외.
export const HIFI_PAGE = 'HiFi';

export const SCREENS = [
  { key: 'V01_온보딩_1', id: '456:1334', view: 'V01' },
  { key: 'V01_권한안내', id: '456:1312', view: 'V01' },
  { key: 'V01_정보_1', id: '456:1348', view: 'V01' },
  { key: 'V01_정보_2', id: '456:1460', view: 'V01' },
  { key: 'V01_정보_3', id: '456:1404', view: 'V01' },
  { key: 'V02_메인', id: '529:663', view: 'V02' },
  { key: 'V02_empty', id: '822:4874', view: 'V02' },
  { key: 'V02_코스정보팝업', id: '822:3453', view: 'V02' },
  { key: 'V10_결과', id: '785:2701', view: 'V10' },
  { key: 'V10_결과_b', id: '785:2793', view: 'V10' },
  { key: 'V10_결과모달', id: '785:2847', view: 'V10' },
  { key: 'V10_결과모달_empty', id: '822:5064', view: 'V10' },
  { key: 'V10_결과모달_empty2', id: '822:5106', view: 'V10' },
  { key: 'V11_기록_주간', id: '682:1385', view: 'V11' },
  { key: 'V11_기록_empty', id: '822:5022', view: 'V11' },
  // 2026-09-13 최신 디자인('최신 디자인' 라벨이 붙은 3종) — 기간 네비게이터 + 월간/연간 차트
  { key: 'V11_주간_new', id: '988:2063', view: 'V11' },
  { key: 'V11_월간_new', id: '988:2339', view: 'V11' },
  { key: 'V11_연간_new', id: '988:2194', view: 'V11' },
  { key: 'V12_기록_전', id: '904:1390', view: 'V12' },
  { key: 'V12_기록_후', id: '615:1484', view: 'V12' },
  // 2026-09-06 피드백: V12는 '뜯긴 상태 고정' — 섹션 '8/23'의 최신 시안
  { key: 'V12_결과_new', id: '956:2130', view: 'V12' },
  // 2026-09-13 최신: 스탬프 제거 + 앱바 우측 '다음 기록' 화살표 추가
  { key: 'V12_기록_후_new', id: '999:3422', view: 'V12' },
  { key: 'V13_설정', id: '618:1110', view: 'V13' },
  { key: 'V13_설정_내정보', id: '618:1124', view: 'V13' },
  { key: 'V14_업적_1', id: '834:5824', view: 'V14' },
  { key: 'V14_업적_2', id: '834:5870', view: 'V14' },
];

/** 캐시 문서에서 id → 노드 인덱스 구축 */
export function indexById(root) {
  const map = new Map();
  (function walk(n) {
    map.set(n.id, n);
    for (const c of n.children ?? []) walk(c);
  })(root);
  return map;
}

/** id → 소속 페이지명 (HiFi 검증용) */
export function pageOf(document) {
  const map = new Map();
  for (const page of document.children ?? []) {
    (function walk(n) {
      map.set(n.id, page.name);
      for (const c of n.children ?? []) walk(c);
    })(page);
  }
  return map;
}

export const eachNode = function* (node) {
  yield node;
  for (const c of node.children ?? []) yield* eachNode(c);
};

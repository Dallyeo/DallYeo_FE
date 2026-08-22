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
  { key: 'V12_기록_전', id: '904:1390', view: 'V12' },
  { key: 'V12_기록_후', id: '615:1484', view: 'V12' },
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

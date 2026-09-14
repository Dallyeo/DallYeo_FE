import { useState } from 'react';
import { ACHIEVEMENT_TABS, type Achievement, type AchievementCategory } from '@/domain/types';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginBanner } from '@/features/login/ui/LoginBanner';
import { useAchievements } from '@/features/achievements/model/useAchievements';

/**
 * V14 업적 — 시안 `V14_업적_1`(999:2490 군산) / `V14_업적_2`(999:2452 전주) /
 * `V14_업적_3`(999:2528 활동).
 *
 * ⚠️ 2026-09-15 전면 교체. 이전 화면은 지역 지도 + 업적 바텀시트(구 시안 834:*)였는데,
 * 새 시안은 **배지 2열 그리드** 한 장이다. 지도·시트·확대 연출은 전부 사라졌다.
 *
 * 탭은 백엔드 `category`(GUNSAN/JEONJU/COMMON)로 그대로 나눈다 — `COMMON`은 지역 무관이라
 * 화면에서는 "활동"으로 부른다. **코드 접두사로 지역을 판정하면 안 된다**(명세 §8).
 *
 * 실측(402폭): 좌우 인셋 26 · 2열 폭 150 · 열/행 간격 50 ·
 * 배지 150 → 이름(+154, 13/28 SB) → 설명(+182, 10/12 M).
 */
export function AchievementsView() {
  const { status } = useAuth();
  const isLoggedIn = status === 'authenticated';
  const [tab, setTab] = useState<AchievementCategory>('GUNSAN');
  const query = useAchievements(isLoggedIn);

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="achievements-view" className="flex flex-1 flex-col overflow-hidden">
        <CategoryTabs value={tab} onChange={setTab} />

        {!isLoggedIn ? (
          <div data-testid="achievements-login-gate" className="flex flex-col gap-3 p-4">
            <p className="text-body text-gray-500">로그인하면 업적을 확인할 수 있어요.</p>
            <LoginBanner />
          </div>
        ) : (
          <AsyncBoundary query={query} loadingLabel="업적을 불러오는 중..." testId="achievements">
            {(items: Achievement[]) => (
              <AchievementGrid items={items.filter((a) => a.category === tab)} />
            )}
          </AsyncBoundary>
        )}
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}

/**
 * 상단 분류 탭 — 시안 `Frame 331`(402폭 기준 y64 h46).
 * 버튼 60×38, 간격 10, 좌측 인셋 16. 활성은 **밑줄 2px green-700**(Figma
 * `individualStrokeWeights.bottom = 2`) + 글자 green-700, 비활성은 gray-500.
 * 아래 구분선은 `Vector 116`(y109, 좌우 19 인셋, gray-250).
 */
function CategoryTabs({
  value,
  onChange,
}: {
  value: AchievementCategory;
  onChange: (next: AchievementCategory) => void;
}) {
  const index = ACHIEVEMENT_TABS.findIndex((t) => t.key === value);
  return (
    <div className="relative z-20 h-[46px] shrink-0 bg-off-white pl-4 pt-1">
      <span aria-hidden className="absolute inset-x-[19px] bottom-1 border-b border-gray-250" />
      <div className="relative inline-flex gap-2.5" role="tablist">
        {ACHIEVEMENT_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={value === key}
            data-testid={`achievement-tab-${key}`}
            onClick={() => onChange(key)}
            className={`h-[38px] w-[60px] text-label-sm transition-colors ${
              value === key ? 'text-green-700' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
        {/* 밑줄 — 탭 폭 60 + 간격 10 이므로 인덱스당 70px 이동 */}
        <span
          aria-hidden
          data-testid="achievement-tab-underline"
          className="absolute bottom-0 left-0 h-[2px] w-[60px] rounded-sm bg-green-700 transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${index * 70}px)` }}
        />
      </div>
    </div>
  );
}

/** 배지 2열 그리드 — 좌우 인셋 26, 열/행 간격 50(시안 `Frame 388` 실측) */
function AchievementGrid({ items }: { items: Achievement[] }) {
  if (items.length === 0) {
    return (
      <p data-testid="achievements-empty" className="p-6 text-center text-body text-gray-500">
        표시할 업적이 없어요.
      </p>
    );
  }
  return (
    <ul
      data-testid="achievement-grid"
      // 시안: 탭 바닥(110) → 그리드 상단(126) = 16
      className="grid min-h-0 flex-1 grid-cols-2 content-start gap-x-[50px] gap-y-[50px] overflow-y-auto px-[26px] pb-8 pt-4"
    >
      {items.map((item) => (
        <AchievementCard key={item.code} item={item} />
      ))}
    </ul>
  );
}

/**
 * 배지 카드 한 장. 획득/미획득이 **세 가지**로 갈린다 —
 * 시안 `V14_업적_1~3`(획득)과 `Section 4`의 `Frame 390~392`(미획득)를 대조해 읽었다.
 *
 * | | 획득 | 미획득 |
 * |---|---|---|
 * | 배지 | `iconOnUrl`(컬러) | `iconOffUrl`(흑백) |
 * | 그림자 | 있음(아래 4px, 20%) | **없음** |
 * | 글자 | 그대로 | **opacity 0.5** |
 *
 * - 흑백 처리는 CSS 필터로 흉내 내지 않는다 — 백엔드가 두 벌을 다 내려준다(§8).
 * - 그림자는 시안이 "같은 이미지를 한 장 더 깔고 opacity 0.2 + blur 4 + 아래로 4px" 한 것인데,
 *   배지 아트가 투명 배경(WebP 450×450)이라 `drop-shadow` 한 줄로 같은 그림이 나온다.
 * - 그림자가 빠지는 만큼 미획득 카드는 이름이 **4px 위로** 붙는다(시안: 획득 +154 / 미획득 +150).
 */
function AchievementCard({ item }: { item: Achievement }) {
  const { unlocked } = item;
  return (
    <li data-testid={`achievement-${item.code}`} className="flex flex-col">
      <img
        src={unlocked ? item.iconOnUrl : item.iconOffUrl}
        alt=""
        loading="lazy"
        data-testid={`achievement-${item.code}-icon`}
        data-unlocked={unlocked}
        className={`aspect-square w-full object-contain ${
          unlocked ? 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]' : ''
        }`}
      />
      {/* 획득 카드만 그림자 오프셋(4px)만큼 띄운다 — 미획득은 배지 바닥에 바로 붙는다 */}
      <div
        data-testid={`achievement-${item.code}-label`}
        className={`${unlocked ? 'mt-1' : ''} ${unlocked ? '' : 'opacity-50'}`}
      >
        <p className="text-center text-label-sm text-black">{item.name}</p>
        <p className="text-center text-overline text-black">{item.description}</p>
      </div>
    </li>
  );
}

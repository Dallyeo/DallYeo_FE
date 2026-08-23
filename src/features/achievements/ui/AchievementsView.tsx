import { useState } from 'react';
import {
  ACHIEVEMENT_REGIONS,
  regionOfAchievement,
  type Achievement,
  type AchievementRegion,
} from '@/domain/types';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginBanner } from '@/features/login/ui/LoginBanner';
import { useAchievements } from '@/features/achievements/model/useAchievements';
import { AchievementSheet } from './AchievementSheet';
import mapGunsan from '@/shared/ui/images/achievement-map-gunsan.jpg';

/**
 * V14 업적 (V14_업적_1 834:5824 / V14_업적_2 834:5870).
 * 상단 지역 탭(군산/전주) + 지역 지도 + 업적 목록 바텀시트(2단 스냅).
 * ⚠️ 업적 달성마다 지도에 초록 선이 그려지는 연출은 **기획 미확정** → 지도 이미지만 표시한다.
 */
export function AchievementsView() {
  const { status } = useAuth();
  const isLoggedIn = status === 'authenticated';
  const [region, setRegion] = useState<AchievementRegion>('GUNSAN');
  // 시트가 내려가면 지도 영역이 넓어져 사진이 확대돼 보인다(시안 _1 402×242 → _2 1100×662)
  const [sheetRaised, setSheetRaised] = useState(true);
  const query = useAchievements(isLoggedIn);

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="achievements-view" className="relative flex flex-1 flex-col">
        <RegionTabs value={region} onChange={setRegion} />

        {/* 지역 지도 — 시트 위 공간을 채운다. 시트를 내리면 영역이 커져 `object-cover`가
            이미지를 더 크게 잡아 **확대돼 보인다**(시안 _1 402×242 → _2 1100×662). */}
        <div
          className="absolute inset-x-0 overflow-hidden bg-gray-200 transition-[bottom] duration-300 ease-out"
          style={{
            // 탭(46) 아래부터 시트 위까지. 상단 여백은 부모(pt-screen)가 이미 처리한다.
            top: 46,
            bottom: sheetRaised ? '60dvh' : '17dvh',
          }}
        >
          <img
            src={mapGunsan}
            alt={`${ACHIEVEMENT_REGIONS.find((r) => r.key === region)?.label} 업적 지도`}
            className="h-full w-full object-cover"
          />
        </div>

        {!isLoggedIn ? (
          <div data-testid="achievements-login-gate" className="flex flex-col gap-3 p-4">
            <p className="text-body text-gray-500">로그인하면 업적을 확인할 수 있어요.</p>
            <LoginBanner />
          </div>
        ) : (
          <AsyncBoundary query={query} loadingLabel="업적을 불러오는 중..." testId="achievements">
            {(items: Achievement[]) => (
              <AchievementSheet
                achievements={items.filter((a) => regionOfAchievement(a.code) === region)}
                raised={sheetRaised}
                onRaisedChange={setSheetRaised}
              />
            )}
          </AsyncBoundary>
        )}
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}

/** 지역 탭 — V11 기간 탭과 동일 규격(60×38, 간격 10, 슬라이딩 밑줄) */
function RegionTabs({
  value,
  onChange,
}: {
  value: AchievementRegion;
  onChange: (r: AchievementRegion) => void;
}) {
  const index = ACHIEVEMENT_REGIONS.findIndex((r) => r.key === value);
  return (
    <div className="relative z-20 h-[46px] shrink-0 bg-off-white pl-4 pt-1">
      <span aria-hidden className="absolute inset-x-[19px] bottom-1 border-b border-gray-250" />
      <div className="relative inline-flex gap-2.5" role="tablist">
        {ACHIEVEMENT_REGIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={value === key}
            data-testid={`region-${key}`}
            onClick={() => onChange(key)}
            className={`h-[38px] w-[60px] text-label-sm transition-colors ${
              value === key ? 'text-green-700' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
        <span
          aria-hidden
          data-testid="region-underline"
          className="absolute bottom-0 left-0 h-[2px] w-[60px] rounded-sm bg-green-700 transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${index * 70}px)` }}
        />
      </div>
    </div>
  );
}

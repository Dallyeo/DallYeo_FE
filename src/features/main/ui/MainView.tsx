import { useNavigate } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useAuth } from '@/features/login/model/useAuth';
import { useSelectedRegion } from '@/features/main/model/useRegions';
import { useRecommendedCourses } from '@/features/main/model/useRecommendedCourses';
import { RegionSelector } from './RegionSelector';
import { CreateCourseButton } from './CreateCourseButton';
import { RecommendedCourseList } from './RecommendedCourseList';
import Logo from '@/shared/ui/icons/dallyeo_white.svg?react';
import IcSettings from '@/shared/ui/icons/ic-settings.svg?react';
import IcQuickReference from '@/shared/ui/icons/ic-quick-reference-all.svg?react';

/** V02 메인뷰 (V02-S1). 그린 헤더(로고·설정·인사말) + 추천 코스 카드 패널 + 플로팅 코스 만들기 + 탭바. */
export function MainView() {
  const { region } = useSelectedRegion();
  const coursesQuery = useRecommendedCourses(region.code);
  const { session } = useAuth();
  const navigate = useNavigate();
  const displayName = session?.displayName ?? '러너';

  return (
    <SafeAreaLayout withTabBar topInset={false}>
      <main data-testid="main-view" className="relative flex min-h-0 flex-1 flex-col">
        {/* 그린 헤더 — 노치까지 채움. Figma: 로고/설정 행 T64(상태바 아래 2) 높이30, 인사말 간격21, 하단 28 */}
        <header className="bg-green-700 px-4 pb-7 pt-safe-top text-off-white">
          <div className="flex h-[30px] items-center justify-between pt-0.5">
            <Logo aria-label="달여" className="h-[19px] w-auto" />
            <button
              type="button"
              data-testid="open-settings"
              aria-label="설정 메뉴 열기"
              onClick={() => navigate('/settings')}
              className="flex h-[30px] w-[30px] items-center justify-center"
            >
              <IcSettings aria-hidden className="h-[25px] w-auto" />
            </button>
          </div>

          <h1 className="mt-[21px] text-heading text-gray-200">
            {displayName} 님,
            <br />
            오늘은 어디로 달려볼까요?
          </h1>
        </header>

        {/* 추천 코스 카드 패널 — 시안상 패널이 하단까지 늘어남 */}
        <section className="flex min-h-0 flex-1 flex-col p-4">
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg shadow-[0px_0px_5.7px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between gap-2 bg-white py-4 pl-[23px] pr-[10px]">
              <h2 className="text-body text-gray-700">추천코스</h2>
              <RegionSelector />
            </div>

            <AsyncBoundary
              query={coursesQuery}
              isEmpty={(courses) => courses.length === 0}
              emptyMessage="추천코스를 준비중에요"
              emptyIcon={<IcQuickReference aria-hidden className="h-[21px] w-auto text-gray-300" />}
              loadingLabel="추천 코스를 불러오는 중..."
            >
              {(courses) => <RecommendedCourseList courses={courses} />}
            </AsyncBoundary>
          </div>
        </section>

        <CreateCourseButton />
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}

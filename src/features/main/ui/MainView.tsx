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
import Logo from '@/shared/ui/icons/DallYeo.svg?react';
import IcSettings from '@/shared/ui/icons/ic-settings.svg?react';

/** V02 메인뷰 (V02-S1). 그린 헤더(로고·설정·인사말) + 추천 코스 카드 패널 + 플로팅 코스 만들기 + 탭바. */
export function MainView() {
  const { region } = useSelectedRegion();
  const coursesQuery = useRecommendedCourses(region.code);
  const { session } = useAuth();
  const navigate = useNavigate();
  const displayName = session?.displayName ?? '러너';

  return (
    <SafeAreaLayout withTabBar topInset={false}>
      <main data-testid="main-view" className="relative flex flex-1 flex-col">
        {/* 그린 헤더 — 노치까지 채움 */}
        <header className="bg-green-700 px-5 pb-8 pt-safe-top text-white">
          <div className="flex items-center justify-between pt-4">
            <Logo aria-label="달여" className="h-5 w-auto" />
            <button
              type="button"
              data-testid="open-settings"
              aria-label="설정 메뉴 열기"
              onClick={() => navigate('/settings')}
            >
              <IcSettings aria-hidden className="h-6 w-6" />
            </button>
          </div>

          <h1 className="mt-5 text-title">
            {displayName} 님,
            <br />
            오늘은 어디로 달려볼까요?
          </h1>
        </header>

        {/* 추천 코스 카드 패널 */}
        <section className="flex flex-1 flex-col p-4">
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="flex items-center justify-between gap-2 bg-gray-200 px-4 py-4">
              <h2 className="text-body text-gray-900">추천코스</h2>
              <RegionSelector />
            </div>

            <AsyncBoundary
              query={coursesQuery}
              isEmpty={(courses) => courses.length === 0}
              emptyMessage="아직 추천 코스가 없어요."
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

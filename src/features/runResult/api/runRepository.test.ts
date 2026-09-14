import { describe, it, expect, vi, afterEach } from 'vitest';
import { runRepository } from './runRepository';

afterEach(() => vi.unstubAllGlobals());

function stubJson(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => body } as Response),
  );
}

const calls = () => (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls;

/** `GET /runs/{id}` 응답 (be-spec-new-260913 §7.4) */
const runDto = {
  id: 1,
  courseId: 'gunsan-jjamppong-run',
  courseName: '짬뽕런',
  start: { lat: 35.95, lng: 126.68 },
  end: { lat: 35.96, lng: 126.69 },
  distanceMeters: 10480,
  durationSeconds: 3600,
  averagePaceSeconds: 344,
  calories: 720,
  imageUrl: '/uploads/runs/fb63bae3.jpg',
  startedAt: '2026-09-13T07:00:00Z',
  finishedAt: '2026-09-13T08:00:00Z',
};

describe('runRepository (V10)', () => {
  describe('getResult — 저장은 네이티브가 하고, 웹은 runId로 읽기만 한다', () => {
    it('/runs/{id} 를 GET 하고 도메인 값으로 매핑한다', async () => {
      stubJson(runDto);
      const result = await runRepository.getResult('1');

      const [url, init] = calls()[0]!;
      expect(String(url)).toContain('/runs/1');
      expect((init as RequestInit).method).toBe('GET');
      expect(result).toMatchObject({
        runId: '1',
        courseId: 'gunsan-jjamppong-run',
        courseName: '짬뽕런',
        distanceKm: 10.48,
        durationSec: 3600,
        avgPaceSecPerKm: 344,
        // 칼로리는 서버가 계산하지 않고 네이티브가 보낸 값을 그대로 돌려준다(§7.1)
        calories: 720,
        completedAt: '2026-09-13T08:00:00Z',
      });
    });

    it('네이티브가 칼로리를 안 보냈으면 키가 빠져 온다 — undefined로 둔다', async () => {
      const noCalories: Partial<typeof runDto> = { ...runDto };
      delete noCalories.calories;
      stubJson(noCalories);
      const result = await runRepository.getResult('1');
      expect(result.calories).toBeUndefined();
    });

    it('imageUrl(서버 절대경로)에 API base를 붙인다', async () => {
      stubJson(runDto);
      const result = await runRepository.getResult('1');
      expect(result.routeImageUrl).toMatch(/\/uploads\/runs\/fb63bae3\.jpg$/);
      expect(result.routeImageUrl).not.toBe('/uploads/runs/fb63bae3.jpg');
    });

    it('자유 러닝은 코스 키가 통째로 빠져 온다 — null 비교가 아니라 존재 여부로 판단한다', async () => {
      const free: Partial<typeof runDto> = { ...runDto };
      delete free.courseId;
      delete free.courseName;
      stubJson(free);
      const result = await runRepository.getResult('2');
      expect(result.courseId).toBeUndefined();
      expect(result.courseName).toBeUndefined();
    });

    it('페이스가 빠져 오면 거리·시간으로 계산해 채운다', async () => {
      const noPace: Partial<typeof runDto> = { ...runDto };
      delete noPace.averagePaceSeconds;
      stubJson(noPace);
      const result = await runRepository.getResult('1');
      expect(result.avgPaceSecPerKm).toBe(Math.round(3600 / 10.48));
    });

    it('newAchievements가 오면 도장 아이콘에도 base를 붙여 넘긴다 (결과창 도장)', async () => {
      stubJson({
        ...runDto,
        newAchievements: [
          {
            code: 'JJAMPPONG',
            category: 'GUNSAN',
            sortOrder: 30,
            name: '짬뽕을 먹을 자격이 있는 자',
            description: '짬뽕거리 코스를 완주했다.',
            iconOnUrl: '/images/achievements/jjamppong_on.webp',
            iconOffUrl: '/images/achievements/jjamppong_off.webp',
            unlocked: true,
            unlockedAt: '2026-09-13T08:00:00Z',
          },
        ],
      });
      const result = await runRepository.getResult('1');
      expect(result.newAchievements).toHaveLength(1);
      expect(result.newAchievements![0]!.iconOnUrl).toMatch(/\/images\/achievements\/jjamppong_on\.webp$/);
      expect(result.newAchievements![0]!.iconOnUrl).not.toBe('/images/achievements/jjamppong_on.webp');
    });

    it('도장이 없으면(재달성·조회) newAchievements 키를 만들지 않는다', async () => {
      stubJson({ ...runDto, newAchievements: [] });
      const result = await runRepository.getResult('1');
      expect(result.newAchievements).toBeUndefined();
    });
  });

  describe('listNearbyPlaces — 도착 좌표로 주변 장소(공개 API)', () => {
    it('완주 지점 좌표 + 반경 500m로 /places/nearby 를 부른다', async () => {
      stubJson([
        {
          id: 'p1',
          name: '편의점',
          category: 'ETC',
          latitude: 35.9,
          longitude: 126.7,
          address: '주소',
          distanceMeters: 120,
          badges: [],
        },
      ]);
      const result = await runRepository.listNearbyPlaces({ lat: 35.9, lng: 126.7 });
      expect(result[0]).toMatchObject({ id: 'p1', segment: 'amenity', distanceM: 120 });
      expect(String(calls()[0]![0])).toContain('/places/nearby?lat=35.9&lng=126.7&radius=500');
    });

    it('카드 한 줄에는 대표 영업시간(openHours)을 쓴다', async () => {
      stubJson([
        {
          id: 'p2',
          name: '카페',
          category: 'CAFE',
          latitude: 35.9,
          longitude: 126.7,
          address: '주소',
          businessHours: '12:00~21:00\n준비시간 14:00~17:00',
          openHours: '12:00~21:00',
          distanceMeters: 30,
        },
      ]);
      const [place] = await runRepository.listNearbyPlaces({ lat: 35.9, lng: 126.7 });
      expect(place).toMatchObject({ segment: 'restaurant', businessHours: '12:00~21:00' });
    });

    it('openHours만 비어 오면 businessHours 첫 줄로 대신한다 (첫 호출에 종종 빈다)', async () => {
      stubJson([
        {
          id: 'p3',
          name: '식당',
          category: 'RESTAURANT',
          latitude: 35.9,
          longitude: 126.7,
          address: '주소',
          businessHours: '11:00~20:00\n라스트오더 19:30',
          openHours: null,
          distanceMeters: 10,
        },
      ]);
      const [place] = await runRepository.listNearbyPlaces({ lat: 35.9, lng: 126.7 });
      expect(place!.businessHours).toBe('11:00~20:00');
    });

    it('외부 관광 API의 간헐 502는 재시도한다 (§9-3)', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          status: 502,
          ok: false,
          json: async () => ({ success: false, error: { code: 'EXTERNAL_API_ERROR' } }),
        } as Response)
        .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response);
      vi.stubGlobal('fetch', fetchMock);

      await expect(runRepository.listNearbyPlaces({ lat: 35.9, lng: 126.7 })).resolves.toEqual([]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});

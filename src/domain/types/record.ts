/**
 * 러닝 기록 도메인 타입 (V11 목록 / V12 상세).
 * 기간 통계(PeriodStats)는 MVP3 대상 — **데이터모델만 정의, UI 보류**.
 */
import type { GeoPoint } from './run';

/** 기록 목록 항목(요약). V11 리스트 카드용. */
export interface RunRecord {
  id: string;
  /** 완주 일시 (ISO 8601) */
  completedAt: string;
  distanceKm: number;
  durationSec: number;
  /** 평균 페이스(초/km). 목록 응답에 없으면 거리·시간으로 계산해 채운다. */
  avgPaceSecPerKm: number;
  /**
   * 소모 칼로리(kcal). 서버가 계산하지 않고 **네이티브가 저장 때 보낸 값**을 돌려준다
   * (be-api-guide-0914 §7.1). 안 보냈으면 키 자체가 없다 → 미표시.
   */
  calories?: number;
  /** 완주한 코스명. 자유 러닝이면 없음. */
  courseName?: string;
  /** 시작 시각 (ISO 8601). V12 "12:00 - 12:30" 구간 표시용 — 목록 응답엔 없다. */
  startedAt?: string;
  /**
   * 경로 이미지 (API base가 붙은 절대 URL).
   * 폴리라인이 계약에서 사라지고(2026-09-14) **네이티브가 그려 올린 이미지**로 대체됐다.
   */
  routeImageUrl?: string;
}

/**
 * 기록 상세 (V12).
 *
 * ⚠️ 2026-09-14 계약 변경 — `polyline`·`completionRate`·출발/도착 **지점명이 모두 사라졌다**.
 * 경로 그림은 `routeImageUrl`(네이티브가 올린 이미지)이 대신하고, 좌표는 출발·도착 2점만 온다.
 * 티켓의 "출발 → 도착" 줄은 지점명 대신 **코스명**으로 그린다(자유 러닝이면 빈 자리).
 */
export interface RunRecordDetail extends RunRecord {
  /** 출발 좌표 */
  start?: GeoPoint;
  /** 도착 좌표 */
  end?: GeoPoint;
}

/**
 * 기간 통계 구간. 시안에 '전체' 탭이 있었으나 **제거 확정**(2026-08-22 사용자 결정).
 * 차트와 기록 리스트 **모두** 이 구간으로 필터된다.
 */
export type StatsPeriod = 'weekly' | 'monthly' | 'yearly';

/** 탭 라벨 (시안 순서) */
export const STATS_PERIODS: { key: StatsPeriod; label: string }[] = [
  { key: 'weekly', label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'yearly', label: '연간' },
];

/** 일자별 거리 (차트용, MVP3) */
export interface DailyDistance {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  distanceKm: number;
}

/**
 * 기간 통계 (MVP3 — 모델만, 현재 UI 미구현).
 * V11 상단 "이번주 총 Nkm / 저번주 대비 ↑Nkm" + 막대그래프의 데이터 계약.
 */
export interface PeriodStats {
  period: StatsPeriod;
  /** 구간 시작/끝 (ISO date) */
  rangeStart: string;
  rangeEnd: string;
  totalDistanceKm: number;
  /** 직전 동일 구간 대비 증감(km) */
  deltaDistanceKm: number;
  daily: DailyDistance[];
}

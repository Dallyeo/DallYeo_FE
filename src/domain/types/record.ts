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
  avgPaceSecPerKm: number;
  calories: number;
}

/** 기록 상세 (V12). 정적 지도 + 경로. */
export interface RunRecordDetail extends RunRecord {
  completionRate: number;
  routePolyline: GeoPoint[];
  /** 정적 지도 이미지 URL (줌 없음) */
  staticMapImageUrl: string;
}

/** 기간 통계 구간 (MVP3) */
export type StatsPeriod = 'weekly' | 'monthly' | 'yearly' | 'all';

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

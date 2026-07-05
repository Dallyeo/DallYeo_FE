import type { UserProfile } from '@/domain/types';

/** V13 설정 상단 프로필 카드. 아바타(사진 또는 이니셜) + 인사말. lo-fi. */
export function ProfileCard({ profile }: { profile: UserProfile }) {
  return (
    <div
      data-testid="profile-card"
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
    >
      <Avatar photoUrl={profile.photoUrl} nickname={profile.nickname} />
      <p className="text-sb-20 text-text-strong">{profile.nickname}, 안녕하세요!</p>
    </div>
  );
}

/** 아바타 — 사진 있으면 이미지, 없으면 닉네임 앞 2글자 */
export function Avatar({ photoUrl, nickname }: { photoUrl?: string | undefined; nickname: string }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className="h-16 w-16 shrink-0 rounded-full bg-bg object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-bg text-m-15 text-subtle"
    >
      {nickname.slice(0, 2)}
    </div>
  );
}

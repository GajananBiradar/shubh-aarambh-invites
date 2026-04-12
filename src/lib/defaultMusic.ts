export const EMBEDDED_TEST_MUSIC_NAME = "Wedding Background Music";

export const EMBEDDED_TEST_MUSIC_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3";

const PLACEHOLDER_MUSIC_PATTERNS = [
  "your-s3-bucket.s3.amazonaws.com",
  "default-music/floral-bgm.mp3",
];

export const isInvalidDefaultMusicUrl = (url?: string | null): boolean => {
  if (!url) return true;

  const normalized = url.trim();
  if (!normalized) return true;

  return PLACEHOLDER_MUSIC_PATTERNS.some((pattern) =>
    normalized.includes(pattern),
  );
};

export const resolveWorkingMusic = (
  url?: string | null,
  name?: string | null,
) => {
  if (isInvalidDefaultMusicUrl(url)) {
    return {
      url: EMBEDDED_TEST_MUSIC_URL,
      name: EMBEDDED_TEST_MUSIC_NAME,
    };
  }

  return {
    url: url!.trim(),
    name: name?.trim() || "Background Music",
  };
};

/**
 * 获取时区偏移量，单位为小时
 * 
 * @param tz 时区字符串，例如 "UTC", "GMT+8", "GMT-08:00"
 * @returns 时区偏移量，单位为小时
 */
export function getTimezoneOffset(tz: string | null | undefined): number {
  // 防空
  if (!tz) return 0;

  // Z | UTC
  if (/^(Z|UTC)$/i.test(tz)) return 0;

  // GMT+8 | GMT-8
  let m = tz.match(/^GMT([+-]\d+)$/i);
  if (m) {
    return parseInt(m[1], 10);
  }

  // GMT+08:00 | GMT-08:00
  m = tz.match(/^GMT([+-]\d+):(\d+)$/i);
  if (m) {
    return parseInt(m[1], 10);
  }

  // 实在不行就是 UTC 时间吧
  return 0;
}

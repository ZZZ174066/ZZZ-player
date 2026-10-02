/**
 * 频谱公共采样：镜像柱 i=0 中心 → i=count-1 外侧
 * 满格门槛适中：尖峰能顶满，又避免大片同时贴顶
 */
(function () {
  /** 略高于 1：中等能量不到顶，强峰仍可满格 */
  const FULL_SCALE = 1.16;
  const FLOOR = 0.1;

  function bandPeak(freq, a, b) {
    const n = freq.length;
    const lo = Math.max(0, Math.min(n - 1, a | 0));
    const hi = Math.max(lo + 1, Math.min(n, b | 0));
    let peak = 0;
    let sum = 0;
    for (let j = lo; j < hi; j++) {
      const v = (freq[j] || 0) / 255;
      sum += v;
      if (v > peak) peak = v;
    }
    return peak * 0.8 + (sum / (hi - lo)) * 0.2;
  }

  function rawLevel(freq, i, count) {
    if (!freq?.length || count < 1) return 0;
    const n = freq.length;
    const t = count <= 1 ? 0 : i / (count - 1);
    const loBin = Math.max(2, Math.floor(n * 0.02));
    const hiBin = Math.max(loBin + count, Math.floor(n * 0.58));
    const ratio = hiBin / loBin;
    const p0 = loBin * Math.pow(ratio, t);
    const p1 = loBin * Math.pow(ratio, Math.min(1, (i + 1) / count));
    const a = Math.floor(p0);
    const b = Math.max(a + 1, Math.ceil(p1));

    let v = bandPeak(freq, a, b);
    v = Math.max(0, v - FLOOR);
    v = Math.min(1, v / (FULL_SCALE - FLOOR));
    v *= 1 + t * 0.38;
    v = Math.pow(Math.min(1, v), 1.55);
    return Math.min(1, v);
  }

  /**
   * 单柱采样（无帧内重整）
   */
  function mirroredLevel(freq, i, count) {
    return rawLevel(freq, i, count);
  }

  /**
   * 半边采样 + 帧内对齐：最强柱≈0.98，略弱柱明显矮一截，减少「整排满格」
   */
  function fillMirrored(freq, out) {
    const count = out.length;
    let peak = 0.001;
    for (let i = 0; i < count; i++) {
      out[i] = rawLevel(freq, i, count);
      if (out[i] > peak) peak = out[i];
    }
    if (peak > 0.22) {
      const s = 0.98 / peak;
      // 安静时温和抬高；已经很高时略压，避免集体贴顶
      const scale = s >= 1 ? Math.min(1.35, s) : Math.max(0.88, s);
      for (let i = 0; i < count; i++) out[i] = Math.min(1, out[i] * scale);
    }
    // 相对峰值的软对比：接近峰值才接近满格
    const p2 = Math.max(0.001, Math.max(...out));
    for (let i = 0; i < count; i++) {
      const rel = out[i] / p2;
      out[i] = Math.pow(rel, 1.25) * 0.98;
    }
    return out;
  }

  window.VizSample = { mirroredLevel, fillMirrored };
})();

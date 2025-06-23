// static/js/rssi-converter.js
class RSSIConverter {
  constructor() {
    // RSSI to Distance 변환 공식 파라미터
    this.txPower = -59;  // 1m 거리에서의 RSSI 값 (dBm)
    this.pathLoss = 2.0; // 경로 손실 지수 (2.0 = 자유공간)
  }

  // RSSI를 거리(미터)로 변환
  rssiToDistance(rssi) {
    if (rssi === 0) return -1.0;

    const ratio = this.txPower / rssi;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10);
    } else {
      const accuracy = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
      return accuracy;
    }
  }

  // 과학적 Log-Distance 모델
  logDistanceModel(rssi) {
    // d = 10^((TxPower - RSSI) / (10 * n))
    const distance = Math.pow(10, (this.txPower - rssi) / (10 * this.pathLoss));
    return Math.max(0.1, distance); // 최소 거리 0.1m
  }

  // 칼만 필터 적용 (노이즈 감소)
  applyKalmanFilter(measurements) {
    // 간단한 이동평균 필터 (실제로는 칼만 필터 구현)
    if (measurements.length < 3) return measurements[measurements.length - 1];

    const recent = measurements.slice(-3);
    return recent.reduce((sum, val) => sum + val, 0) / recent.length;
  }
}

// static/js/trilateration.js
class Trilateration {
  constructor(sensorPositions) {
    this.sensors = sensorPositions; // [{x, y, mac}, {x, y, mac}, {x, y, mac}]
  }

  // 3개 센서의 RSSI로 위치 계산
  calculatePosition(rssiData) {
    // rssiData: {mac1: rssi1, mac2: rssi2, mac3: rssi3}
    const converter = new RSSIConverter();

    // RSSI를 거리로 변환
    const distances = [];
    for (let sensor of this.sensors) {
      const rssi = rssiData[sensor.mac];
      if (rssi !== undefined) {
        const distance = converter.logDistanceModel(rssi);
        distances.push({
          x: sensor.x,
          y: sensor.y,
          distance: distance,
          mac: sensor.mac
        });
      }
    }

    if (distances.length < 3) {
      console.warn('삼변측량을 위해 최소 3개 센서 필요');
      return null;
    }

    return this.trilateratePosition(distances);
  }

  // 실제 삼변측량 계산
  trilateratePosition(distances) {
    const [p1, p2, p3] = distances;

    // 기하학적 삼변측량 공식
    const A = 2 * (p2.x - p1.x);
    const B = 2 * (p2.y - p1.y);
    const C = Math.pow(p1.distance, 2) - Math.pow(p2.distance, 2) -
              Math.pow(p1.x, 2) + Math.pow(p2.x, 2) -
              Math.pow(p1.y, 2) + Math.pow(p2.y, 2);

    const D = 2 * (p3.x - p2.x);
    const E = 2 * (p3.y - p2.y);
    const F = Math.pow(p2.distance, 2) - Math.pow(p3.distance, 2) -
              Math.pow(p2.x, 2) + Math.pow(p3.x, 2) -
              Math.pow(p2.y, 2) + Math.pow(p3.y, 2);

    const denominator = A * E - B * D;
    if (Math.abs(denominator) < 1e-10) {
      console.warn('센서들이 일직선상에 있어 삼변측량 불가');
      return null;
    }

    const x = (C * E - F * B) / denominator;
    const y = (A * F - D * C) / denominator;

    return { x, y, confidence: this.calculateConfidence(distances, x, y) };
  }

  // 위치 추정 신뢰도 계산
  calculateConfidence(distances, estimatedX, estimatedY) {
    let totalError = 0;
    for (let d of distances) {
      const actualDistance = Math.sqrt(
        Math.pow(d.x - estimatedX, 2) + Math.pow(d.y - estimatedY, 2)
      );
      totalError += Math.abs(actualDistance - d.distance);
    }

    const avgError = totalError / distances.length;
    return Math.max(0, 1 - (avgError / 10)); // 0~1 범위의 신뢰도
  }
}

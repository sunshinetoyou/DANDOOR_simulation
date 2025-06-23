// static/js/path-tracker.js
class PathTracker {
  constructor(predefinedPath, sensorConfig) {
    this.truePath = predefinedPath;     // 실제 경로 [{x, y, timestamp}]
    this.estimatedPath = [];            // 추정된 경로
    this.trilateration = new Trilateration(sensorConfig);
    this.currentIndex = 0;
  }

  // 새로운 RSSI 데이터로 위치 추정
  processRSSIData(rssiData, timestamp) {
    const estimatedPos = this.trilateration.calculatePosition(rssiData);

    if (estimatedPos) {
      this.estimatedPath.push({
        x: estimatedPos.x,
        y: estimatedPos.y,
        timestamp: timestamp,
        confidence: estimatedPos.confidence,
        index: this.currentIndex
      });

      this.currentIndex++;
      return estimatedPos;
    }
    return null;
  }

  // 정확도 계산 (실제 경로 vs 추정 경로)
  calculateAccuracy() {
    if (this.estimatedPath.length === 0) return 0;

    let totalError = 0;
    let validComparisons = 0;

    for (let estimated of this.estimatedPath) {
      // 시간이나 인덱스 기준으로 가장 가까운 실제 위치 찾기
      const truePos = this.findClosestTruePosition(estimated);

      if (truePos) {
        const error = Math.sqrt(
          Math.pow(estimated.x - truePos.x, 2) +
          Math.pow(estimated.y - truePos.y, 2)
        );
        totalError += error;
        validComparisons++;
      }
    }

    const avgError = totalError / validComparisons;
    return {
      avgError: avgError,
      accuracy: Math.max(0, 1 - (avgError / 10)), // 정규화된 정확도
      totalPoints: validComparisons
    };
  }

  findClosestTruePosition(estimated) {
    if (estimated.index < this.truePath.length) {
      return this.truePath[estimated.index];
    }
    return null;
  }

  // 시각화를 위한 데이터 반환
  getVisualizationData() {
    return {
      truePath: this.truePath,
      estimatedPath: this.estimatedPath,
      accuracy: this.calculateAccuracy()
    };
  }
}

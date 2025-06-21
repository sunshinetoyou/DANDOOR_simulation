function sketch2D(p) {
  let table;
  let locations = [];
  let currentIndex = 0;

  p.preload = function() {
    table = p.loadTable('data/test.csv', 'csv', 'header');
  };
  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(255);
  };
  p.draw = function() {
    p.background(255);

    // 점들 그리기
    for (let i = 0; i < locations.length; i++) {
      const point = locations[i];

      // mac별 색상
      let colorVal;
      if (point.mac === '00:0a:95:9d:68:01') colorVal = p.color(255,0,0);
      else if (point.mac === '00:0a:95:9d:68:02') colorVal = p.color(0,255,0);
      else colorVal = p.color(0,0,255);

      p.fill(colorVal);
      p.noStroke();

      // 최근 점은 크게
      let size = (i === locations.length - 1) ? 20 : 15;
      p.ellipse(point.x, point.y, size, size);

      // 점 번호
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(10);
      p.text(point.index, point.x, point.y);
    }
    p.textAlign(p.LEFT, p.BASELINE);

    // 진행 바
    drawProgressBar(p, locations.length, table.getRowCount(), 50, 100, p.width - 100, 30);
  };

  function addNextPoint() {
    if (currentIndex >= table.getRowCount()) return;

    const rssi = Number(table.getString(currentIndex, 'rssi'));
    const mac = table.getString(currentIndex, 'mac');
    const name = table.getString(currentIndex, 'name');

    const newPoint = {
      x: p.map(rssi, -100, 0, 50, p.width-50),
      y: p.map(currentIndex, 0, table.getRowCount()-1, 150, p.height-50),
      rssi: rssi,
      mac: mac,
      name: name,
      index: currentIndex
    };

    locations.push(newPoint);
    currentIndex++;
    console.log(`점 추가: ${name} (인덱스: ${currentIndex-1})`);
  }
  function removePreviousPoint() {
    if (locations.length === 0) return;

    const removedPoint = locations.pop();
    currentIndex--;
    console.log(`점 제거: ${removedPoint.name} (인덱스: ${removedPoint.index})`);
  }

  // 마우스 휠로 점 추가/제거
  p.mouseWheel = function(event) {
    if (event.delta > 0) {
      addNextPoint();
    } else if (event.delta < 0) {
      removePreviousPoint();
    }
    return false; // 기본 스크롤 방지[2][3][7]
  };
}

// 진행 바 그리기 함수
function drawProgressBar(p, progress, total, x, y, w, h) {
  let percent = progress / total;
  p.noStroke();
  p.fill(220);
  p.rect(x, y, w, h);
  p.fill(50, 200, 100);
  p.rect(x, y, w * percent, h);
  p.fill(0);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(`${Math.round(percent*100)}% (${progress}/${total})`, x + w/2, y + h/2);
}

new p5(sketch2D, 'sketch-container');
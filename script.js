




(() => {
  // параметры
  const config = {
    backCol: "#161616",
    sphereRad: 0.7,

    fallVel: 1,
    rotateVel: 0.6,

    attractorSize: 0.6,
    mouseSmooth: 0.1,

    parallaxX: 180,
    parallaxY: 75,

    spawnPeriod: 40,
    defaultFrameRate: 1000 / 60, 
  };

  // подключение холста
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext("2d");

  let width, height, cx, cy, sphereRad;
  const resize = () => {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;
    cx = width / 2;
    cy = height / 2;
    sphereRad = cy * config.sphereRad;
  };

  resize();
  window.addEventListener("resize", resize);

  // подключение мыши
  let mx = width / 2, my = height / 2, mtx = width / 2, mty = height / 2;
  window.addEventListener("mousemove", e => {
    mtx = e.x;
    mty = e.y;
  });

  class Orb {
    constructor () {
      this.height = -sphereRad;
      this.angle = Math.random() * 36;
      this.size = Math.random() * 5 + 2;
      this.isEnd = false;
      this.rotateVel = config.rotateVel + config.rotateVel * Math.random();
    };

    refresh (crr) {
      let angle = (this.angle - config.parallaxX * mx / width + 30) % 36;
      let radians = angle / 180 * Math.PI;

      let rotateY = (my - cy) / cy * config.parallaxY / 80 * Math.PI;

      let cos = Math.cos(radians);
      let sin = Math.sin(radians);

      let distToAxis = Math.sqrt(sphereRad**2 - this.height**2);

      let sinAxis = distToAxis / sphereRad;

      let x = cx + distToAxis * cos;
      let y = cy + this.height * Math.cos(rotateY) + distToAxis * Math.sin(rotateY) * sin;

      let distToCenter = Math.hypot(x - cx, y - cy);

      let optic = this.size * 0.7 * (-this.height * Math.sin(rotateY) + distToAxis * Math.cos(rotateY) * sin) / sphereRad;
      let size = this.size + optic;

      let h = Math.atan2(y - cy, x - cx) / Math.PI * 180;
      let s = 100;
      let l = 50;
      let o = sinAxis;
      let color = `hsl(${h}, ${s}%, ${l}%, ${o})`;

      if (optic > 0 || distToCenter >= sphereRad * config.attractorSize) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      this.height += (config.fallVel * 0.05 + config.fallVel * sinAxis) * crr;
      if (this.height > sphereRad) {
        this.height = sphereRad;
        this.isEnd = true;
      }

      this.angle = (this.angle + this.rotateVel * crr) % 360;
    };
  };

  class ParticlesSystem {
    constructor () {
      this.particles = [];
      this.spawnTime = Date.now();
    };

    spawn () {
      if (Date.now() - this.spawnTime > config.spawnPeriod) {
        this.spawnTime = Date.now();
        this.particles.push(new Orb());
      }
    };

    delete () {
      this.particles = this.particles.filter(e => !e.isEnd);
    };

    update (crr) {
      this.spawn();
      this.delete();

      this.particles.forEach(e => e.refresh(crr));
    };
  };

  const particlesSystem = new ParticlesSystem();

  // цикл анимации
  let lastCall = null;
  const loop = function () {
    requestAnimationFrame(loop);

    let crr = 1;
    if (lastCall != null) {
      crr = (Date.now() - lastCall) / config.defaultFrameRate;
    }
    lastCall = Date.now();

    ctx.save();
    ctx.fillStyle = config.backCol;
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";
    particlesSystem.update(crr);
    ctx.restore();

    mx += (mtx - mx) * config.mouseSmooth;
    my += (mty - my) * config.mouseSmooth;
  };

  window.addEventListener("load", loop);

})();



// ============================================================
// 💕 爱心轨迹动画
// ============================================================

(function () {
  const hearts = [];
  const canvas = document.getElementById("heartCanvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawHeart(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.bezierCurveTo(-5, -15, -15, -15, -15, -5);
    ctx.bezierCurveTo(-15, 5, 0, 15, 0, 25);
    ctx.bezierCurveTo(0, 15, 15, 5, 15, -5);
    ctx.bezierCurveTo(15, -15, 5, -15, 0, -5);
    ctx.closePath();
    ctx.fill();
  }

  function createHeart(x, y, type) {
    let color, alphaDecay;

    if (type === "auto") {
      color = `hsla(${Math.random() * 360}, 70%, 80%, 0.6)`;
      alphaDecay = 0.003;
    } else {
      color = `hsla(${Math.random() * 360}, 100%, 65%, 1)`;
      alphaDecay = 0.01;
    }

    hearts.push({
      x,
      y,
      size: Math.random() * 0.6 + 0.4,
      alpha: 1,
      angle: Math.random() * 2 * Math.PI,
      rotateSpeed: (Math.random() - 0.5) * 0.2,
      color,
      speed: Math.random() * 1.5 + 0.5,
      alphaDecay,
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      ctx.save();
      ctx.globalAlpha = h.alpha;
      ctx.fillStyle = h.color;
      ctx.translate(h.x, h.y);
      ctx.rotate(h.angle);
      ctx.scale(h.size, h.size);
      drawHeart(ctx);
      ctx.restore();

      h.y -= h.speed;
      h.alpha -= h.alphaDecay;
      h.angle += h.rotateSpeed;

      if (h.alpha <= 0) {
        hearts.splice(i, 1);
      }
    }

    requestAnimationFrame(render);
  }

  // 底部自动升起爱心
  setInterval(() => {
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight + 50;
    createHeart(x, y, "auto");
  }, 800);

  // 鼠标移动产生爱心
  window.addEventListener("mousemove", (e) => {
    if (Math.random() < 0.05) {
      createHeart(e.clientX, e.clientY, "mouse");
    }
  });

  // 点击产生爱心
  window.addEventListener("click", (e) => {
    createHeart(e.clientX, e.clientY, "mouse");
  });

  render();
})();

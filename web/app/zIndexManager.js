class ZIndexManager {
  constructor(app, scene) {
    this.app = app;
    this.scene = scene;

    this.init();
  }

  updateZIndexOrder() {
    this.scene.children.sort((a, b) => {
      const aZIndex = a.zIndex || 0;
      const bZIndex = b.zIndex || 0;

      return aZIndex - bZIndex;
    });
  }

  init() {
    this.app.ticker.add(() => {
      this.updateZIndexOrder();
    });
  }
}

export default ZIndexManager;

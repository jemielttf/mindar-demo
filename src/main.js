import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import './style.css';

const start = async () => {
  // Vite の index.html 内に <div id="app"></div> を置いておく
  const mindarThree = new MindARThree({
    container: document.querySelector('#app'),
    imageTargetSrc: './targets.mind', // public フォルダ直下に配置
    uiScanning: 'yes',
    uiLoading: 'yes',
    maxTrack: 3, // 最大で 3 個のターゲットを同時に追跡する
  });

  const { renderer, scene, camera } = mindarThree;

  await mindarThree.start();

  const raycaster = new THREE.Raycaster(),
        mouse     = new THREE.Vector2(),
        canvas    = mindarThree.renderer.domElement;

  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('touchend', onTouchEnd, false);

  const color_set = [0xff66cc, 0x33ff85, 0x7de1ff],
        markerDimensions = mindarThree.controller.markerDimensions;
  
  console.log(mindarThree, markerDimensions, markerDimensions.length);

  // target のアンカーを追加
  // markerDimensions の長さに応じてアンカーを追加
  markerDimensions.forEach((_, index) => mindarThree.addAnchor(index));

  mindarThree.anchors.forEach(anchor => {
    const idx         = anchor.targetIndex,
          [w, h]      = markerDimensions[anchor.targetIndex],
          scale_ratio = 1.0;
    
    console.log(anchor, w, h, `0x${color_set[idx].toString(16)}`);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(scale_ratio, (h / w) * scale_ratio),
      new THREE.MeshBasicMaterial({ color: color_set[idx] })
    );
    anchor.group.add(plane);

    anchor.onTargetFound = () => {
      console.log(`ターゲット ${anchor.targetIndex} が見つかりました`);
    };
    anchor.onTargetLost = () => {
      console.log(`ターゲット ${anchor.targetIndex} が失われました`);
    };
  });

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  function onMouseUp(event) {
    // 1. マウス座標をキャンバス内で正規化
    // getBoundingClientRect で Canvas の位置とサイズを取得
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 2. Raycaster をカメラから飛ばす
    raycaster.setFromCamera(mouse, camera);

    // 3. 交差判定をする対象を配列で渡す（Plane Mesh の配列とか）
    //    ここでは mindarThree.anchors 内の plane を全部まとめておくと楽
    const clickableObjects = mindarThree.anchors.map(anchor => {
      // anchor.group.children の中に Mesh が混ざってるから、例えば一番最初の子を使うと単純
      return anchor.group.children[0];
    });

    const intersects = raycaster.intersectObjects(clickableObjects, true);
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      // 例：何番目のターゲットと紐づいてるかを知りたいなら
      const anchor = mindarThree.anchors.find(a => a.group.children[0] === hitMesh);
      const idx = anchor?.targetIndex;
      console.log(`Plane をクリックした！対象ターゲット: ${idx}`);
    }
  }

  function onTouchEnd(event) {
    // タッチは touches[0] を使う
    event.preventDefault(); // スクロール抑制とか
    const touch = event.changedTouches[0];
    console.log({ touch }, event.touches);
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const clickableObjects = mindarThree.anchors.map(anchor => anchor.group.children[0]);
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const anchor = mindarThree.anchors.find(a => a.group.children[0] === hitMesh);
      const idx = anchor?.targetIndex;
      console.log(`Plane をタップした！対象ターゲット: ${idx}`);
    }
  }
};

start();
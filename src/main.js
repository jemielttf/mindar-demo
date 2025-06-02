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
};

start();
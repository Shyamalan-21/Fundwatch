import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Layers, Eye, Sparkles, Box, Flame } from 'lucide-react';

export default function ContourHeatmap3D({ dataPoints = [] }) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [contourSlices, setContourSlices] = useState(12);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshGroupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 450;

    // Scene with dark pitch black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(28, 22, 28);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const greenLight = new THREE.PointLight(0x00ff66, 2.5, 70);
    greenLight.position.set(10, 15, 10);
    scene.add(greenLight);

    // Group for rotating mesh
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Build 3D Bounding Box & Coordinate Grid (Black & Green Theme)
    const boxSize = 20;
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize * 0.7, boxSize);
    const boxWireframe = new THREE.WireframeGeometry(boxGeometry);
    const boxLine = new THREE.LineSegments(boxWireframe, new THREE.LineBasicMaterial({
      color: 0x064e3b,
      transparent: true,
      opacity: 0.8
    }));
    boxLine.position.y = (boxSize * 0.7) / 2;
    meshGroup.add(boxLine);

    // 3D Axis Grid Floor (Emerald Green Grid lines)
    const gridFloor = new THREE.GridHelper(boxSize, 10, 0x10b981, 0x064e3b);
    gridFloor.position.y = 0;
    meshGroup.add(gridFloor);

    // Green Elevation Colormap: Dark Green -> Emerald -> Neon Lime -> Glowing Bright White
    function getGreenThemeColor(h, maxH = 10) {
      const norm = Math.min(1.0, Math.max(0.0, h / maxH));
      const color = new THREE.Color();
      if (norm < 0.25) {
        // Deep Emerald
        color.setRGB(0.02, 0.2 + norm * 1.5, 0.15);
      } else if (norm < 0.5) {
        // Medium Emerald to Bright Green
        color.setRGB(0.05 + (norm - 0.25) * 0.8, 0.6 + (norm - 0.25) * 1.2, 0.25);
      } else if (norm < 0.75) {
        // Neon Lime Green
        color.setRGB(0.25 + (norm - 0.5) * 1.5, 0.95, 0.35);
      } else {
        // Glowing Summit (Lime to White)
        color.setRGB(0.6 + (norm - 0.75) * 1.6, 1.0, 0.7 + (norm - 0.75) * 1.2);
      }
      return color;
    }

    // Build 3D Contour Elevation Surface Mesh
    const gridRes = 36;
    const surfGeom = new THREE.PlaneGeometry(boxSize * 0.9, boxSize * 0.9, gridRes - 1, gridRes - 1);
    surfGeom.rotateX(-Math.PI / 2);

    const positions = surfGeom.attributes.position;
    const colors = [];

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      const p1 = 8.5 * Math.exp(-((x - 4.5) ** 2 + (z - 4.5) ** 2) / 12.0);
      const p2 = 6.8 * Math.exp(-((x - 5.0) ** 2 + (z + 4.0) ** 2) / 14.0);
      const p3 = 5.2 * Math.exp(-((x + 4.0) ** 2 + (z - 3.5) ** 2) / 10.0);
      const baseline = 0.8 * Math.sin(x * 0.4) * Math.cos(z * 0.4) + 1.2;

      const y = Math.max(0.1, p1 + p2 + p3 + baseline);
      positions.setY(i, y);

      const c = getGreenThemeColor(y, 9.0);
      colors.push(c.r, c.g, c.b);
    }

    surfGeom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    surfGeom.computeVertexNormals();

    const surfMat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 90,
      transparent: true,
      opacity: 0.92,
      wireframe: false
    });

    const surfaceMesh = new THREE.Mesh(surfGeom, surfMat);
    meshGroup.add(surfaceMesh);

    // Neon Green Wireframe overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframeMesh = new THREE.Mesh(surfGeom, wireframeMat);
    wireframeMesh.position.y = 0.02;
    meshGroup.add(wireframeMesh);

    // Floor projected contour slices
    const contourGroup = new THREE.Group();
    const sliceCount = contourSlices;
    for (let s = 1; s <= sliceCount; s++) {
      const elevation = (s / sliceCount) * 8.5;
      const sliceColor = getGreenThemeColor(elevation, 8.5);

      const floorRingGeom = new THREE.RingGeometry(s * 0.7, s * 0.7 + 0.15, 32);
      floorRingGeom.rotateX(-Math.PI / 2);
      const floorRingMat = new THREE.MeshBasicMaterial({
        color: sliceColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const floorRing = new THREE.Mesh(floorRingGeom, floorRingMat);
      floorRing.position.set(4.5, 0.05, 4.5);
      contourGroup.add(floorRing);
    }
    meshGroup.add(contourGroup);

    // Render loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        meshGroup.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Drag Rotation
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      meshGroup.rotation.y += deltaX * 0.008;
      meshGroup.rotation.x += deltaY * 0.008;

      meshGroup.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, meshGroup.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [autoRotate, contourSlices]);

  return (
    <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
              CHART 4: 3D CONTOUR SURFACE
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-black">
              Matplotlib contourf3d Style
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-400" />
            Multidimensional Anomaly Density Terrain ($X, Y, Z$)
          </h3>
          <p className="text-xs text-slate-300 font-bold">
            Interactive 3D Iso-contour surface: <strong>X</strong> (Cost Outlier), <strong>Z</strong> (Velocity Surge), <strong>Y</strong> (Risk Summit)
          </p>
        </div>

        {/* 3D Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-xl border-2 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              autoRotate
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30'
                : 'bg-slate-900 border-emerald-500/40 text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
          </button>

          <button
            onClick={() => {
              if (meshGroupRef.current) {
                meshGroupRef.current.rotation.set(0, 0, 0);
              }
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:bg-slate-800 text-xs font-black cursor-pointer shadow-sm"
          >
            Reset Angle
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-black shadow-inner">
        <div ref={mountRef} className="w-full cursor-grab active:cursor-grabbing" />

        {/* 3D Axis Legend HUD Overlay */}
        <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 p-3 rounded-2xl text-[11px] space-y-1.5 text-slate-300 shadow-lg pointer-events-none font-bold">
          <div className="font-black text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            3D Cartesian Coordinate Space
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span><strong>X-Axis:</strong> Cost Deviation vs Peer Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span><strong>Z-Axis:</strong> Turnaround Velocity Rate ($\Delta T$)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-200"></span>
            <span><strong>Y-Elevation:</strong> Risk Density Summit (CRS Height)</span>
          </div>
        </div>

        {/* Elevation Gradient Legend Bar */}
        <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 px-4 py-2.5 rounded-2xl text-[11px] space-y-1 shadow-lg font-bold">
          <div className="text-[10px] text-slate-400 font-mono font-bold">ELEVATION / RISK COLORMAP</div>
          <div className="w-40 h-3 rounded-full bg-gradient-to-r from-emerald-900 via-emerald-500 via-lime-400 to-white border border-emerald-500/40"></div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
            <span>Low (0)</span>
            <span>Med (50)</span>
            <span className="text-emerald-400 font-black">Critical (100)</span>
          </div>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-4 left-4 text-[10px] text-slate-400 font-mono font-bold bg-slate-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 pointer-events-none shadow-sm">
          🖱️ Click & drag to rotate 3D mesh in any direction
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GameCube({ size = 200 }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 4;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Cube geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    // Create materials for each face with game icons/colors
    const gameColors = [
      0x4CAF50, // Future Snake - Green
      0x2196F3, // Tic-Tac-Toe - Blue
      0xFF9800, // Pong - Orange
      0x9C27B0, // Purple
      0xE91E63, // Pink
      0x00BCD4, // Cyan
    ];

    const materials = gameColors.map(color => {
      return new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        specular: 0x444444,
      });
    });

    // Create cube with different colored faces
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    cubeRef.current = cube;

    // Add edges for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });
    const edgesMesh = new THREE.LineSegments(edges, lineMaterial);
    cube.add(edgesMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Rotate cube
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.008;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (geometry) geometry.dispose();
      materials.forEach(m => m.dispose());
    };
  }, [size]);

  // Handle resize
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;

    rendererRef.current.setSize(size, size);
  }, [size]);

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
}

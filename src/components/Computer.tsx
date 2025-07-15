import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

// Loader como overlay fuera del Canvas
const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-400 border-solid" />
  </div>
);


const ComputerModel = () => {
  const gltf = useGLTF('/computer/scene.gltf'); // Ruta desde /public

  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <pointLight intensity={1} />
      <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} castShadow />
      <primitive
        object={gltf.scene}
        scale={0.75}
        position={[0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  );
};

const Computers = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Retraso artificial opcional si deseas ver el spinner más tiempo
    const timeout = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative w-full h-[400px]">
      {!isLoaded && <Loader />}
      <Canvas
        frameloop="demand"
        shadows
        camera={{ position: [20, 3, 5], fov: 25 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} />
        <Suspense fallback={null}>
          <ComputerModel />
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Computers;

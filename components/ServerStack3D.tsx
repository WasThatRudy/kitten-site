"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Edges } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const GREEN = "#00d86a";

function ServerUnit({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      <RoundedBox args={[1.9, 0.42, 1.2]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color="#232b26" roughness={0.5} metalness={0.2} />
        <Edges threshold={20} color="#97a19a" />
      </RoundedBox>
      {[0.55, 0.72, 0.89].map((x, i) => (
        <mesh key={i} position={[x - 0.1, 0, 0.61]}>
          <circleGeometry args={[0.035, 12]} />
          <meshBasicMaterial color={GREEN} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Stack({ x, units = 3 }: { x: number; units?: number }) {
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: units }).map((_, i) => (
        <ServerUnit key={i} y={i * 0.52 - 0.52} />
      ))}
    </group>
  );
}

function Packets({ animate }: { animate: boolean }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const offsets = useMemo(
    () => Array.from({ length: 5 }, (_, i) => i / 5),
    []
  );

  useFrame(({ clock }) => {
    const base = animate ? clock.getElapsedTime() * 0.14 : 0.35;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = (base + offsets[i]) % 1;
      m.position.x = -2.1 + t * 4.2;
      m.position.y = 0.15 + Math.sin(Math.PI * t) * 0.7;
      m.position.z = Math.sin(t * Math.PI * 2 + i) * 0.12;
      const s = 0.5 + Math.sin(Math.PI * t) * 0.5;
      m.scale.setScalar(0.5 + s * 0.5);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.25 + s * 0.75;
    });
  });

  return (
    <>
      {offsets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshBasicMaterial color={GREEN} transparent toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function CrescentRing({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !animate) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.35;
  });
  return (
    <group ref={group} position={[2.1, 0.05, 0]}>
      <mesh rotation={[1.15, 0, 0.1]}>
        <torusGeometry args={[1.35, 0.022, 10, 90, Math.PI * 1.45]} />
        <meshBasicMaterial color={GREEN} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !animate) return;
    group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.16;
    group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.09) * 0.045;
  });
  return (
    <group ref={group}>
      <ambientLight intensity={1.0} />
      <directionalLight position={[3, 5, 6]} intensity={2.2} />
      <pointLight position={[2.1, 1, 2]} intensity={2} color={GREEN} distance={6} />
      <Stack x={-2.1} />
      <Stack x={2.1} />
      <Packets animate={animate} />
      <CrescentRing animate={animate} />
    </group>
  );
}

export default function ServerStack3D({ animate }: { animate: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 1.3, 8.4], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      style={{ background: "transparent" }}
      aria-hidden
    >
      <Scene animate={animate} />
    </Canvas>
  );
}

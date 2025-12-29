import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import WeaponSelector from './WeaponSelector';
import { useWeaponStore } from '../store/weaponStore';
import { usePhysicsStore } from '../store/physicsStore';

// 击打特效组件 - 优化设计
const HitEffect: React.FC<{ position: THREE.Vector3; color: string; onComplete: () => void }> = ({ position, color, onComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const lightBeamsRef = useRef<THREE.Mesh[]>([]);
  const [shouldComplete, setShouldComplete] = useState(false);
  const particleCount = 15; // 减少粒子数量以提高性能
  const beamCount = 4; // 减少光束数量以提高性能
  
  // 初始化粒子
  useEffect(() => {
    particlesRef.current = [];
    lightBeamsRef.current = [];
    setShouldComplete(false);
  }, [position, color]);
  
  // 处理完成逻辑
  useEffect(() => {
    if (shouldComplete) {
      onComplete();
    }
  }, [shouldComplete, onComplete]);
  
  useFrame(() => {
    if (groupRef.current) {
      // 如果粒子还没有创建，创建粒子和光束
      if (particlesRef.current.length === 0) {
        // 创建中心爆炸效果
        const explosionGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 1
        });
        const explosionMesh = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosionMesh.userData = {
          startTime: Date.now(),
          type: 'explosion'
        };
        particlesRef.current.push(explosionMesh);
        groupRef.current.add(explosionMesh);
        
        // 创建主粒子
        for (let i = 0; i < particleCount; i++) {
          // 随机粒子类型
          const particleType = Math.random() > 0.5 ? 'sphere' : 'cube';
          const geometry = particleType === 'sphere' 
            ? new THREE.SphereGeometry(0.06, 12, 12)
            : new THREE.BoxGeometry(0.08, 0.08, 0.08);
          
          // 创建更丰富的材质效果
          const material = new THREE.MeshPhysicalMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            emissive: color,
            emissiveIntensity: 1,
            metalness: 0.8,
            roughness: 0.2
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // 随机初始位置和速度
          const angle1 = Math.random() * Math.PI * 2;
          const angle2 = Math.random() * Math.PI;
          const radius = Math.random() * 0.3;
          
          mesh.position.set(
            position.x + Math.sin(angle1) * Math.sin(angle2) * radius,
            position.y + Math.cos(angle2) * radius,
            position.z + Math.cos(angle1) * Math.sin(angle2) * radius
          );
          
          // 存储粒子引用和速度
          mesh.userData = {
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 8, // 更快的速度
              (Math.random() - 0.5) * 8 + 4, // 更强的向上初速度
              (Math.random() - 0.5) * 8
            ),
            rotationSpeed: new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3
            ),
            startTime: Date.now(),
            type: 'particle',
            size: particleType === 'sphere' ? 0.06 : 0.08
          };
          
          particlesRef.current.push(mesh);
          groupRef.current.add(mesh);
        }
        
        // 创建光束效果
        for (let i = 0; i < beamCount; i++) {
          const angle = (i / beamCount) * Math.PI * 2;
          const beamGeometry = new THREE.CylinderGeometry(0.03, 0.01, 2, 8);
          const beamMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
          });
          
          const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
          beamMesh.position.set(
            position.x,
            position.y,
            position.z
          );
          
          // 设置光束朝向
          beamMesh.lookAt(
            Math.cos(angle) * 5 + position.x,
            Math.sin(angle) * 5 + position.y,
            Math.sin(angle * 0.5) * 5 + position.z
          );
          
          beamMesh.userData = {
            startTime: Date.now(),
            type: 'beam',
            originalRotation: beamMesh.rotation.clone()
          };
          
          lightBeamsRef.current.push(beamMesh);
          groupRef.current.add(beamMesh);
        }
      } else {
        // 更新所有效果
        let allEffectsComplete = true;
        
        // 更新所有粒子和爆炸效果
        particlesRef.current.forEach((particle) => {
          if (particle) {
            const elapsed = (Date.now() - particle.userData.startTime) / 1000;
            
            if (particle.userData.type === 'explosion') {
              // 爆炸效果：快速扩大并淡出
              const scale = Math.min(elapsed * 5, 2);
              particle.scale.set(scale, scale, scale);
              
              const opacity = Math.max(0, 1 - elapsed * 3);
              (particle.material as THREE.MeshBasicMaterial).opacity = opacity;
              
              if (opacity > 0) {
                allEffectsComplete = false;
              }
            } else {
              // 普通粒子更新
              const velocity = particle.userData.velocity as THREE.Vector3;
              const rotationSpeed = particle.userData.rotationSpeed as THREE.Vector3;
              
              // 更新位置（改进的物理模拟）
              particle.position.x += velocity.x * 0.016;
              particle.position.y += velocity.y * 0.016;
              particle.position.z += velocity.z * 0.016;
              
              // 重力和空气阻力
              velocity.y -= 0.15;
              velocity.multiplyScalar(0.98); // 空气阻力
              
              // 更新旋转
              particle.rotation.x += rotationSpeed.x;
              particle.rotation.y += rotationSpeed.y;
              particle.rotation.z += rotationSpeed.z;
              
              // 脉动大小效果
              const pulseScale = 1 + Math.sin(elapsed * 20) * 0.2;
              const baseSize = particle.userData.size;
              particle.scale.set(
                baseSize * pulseScale,
                baseSize * pulseScale,
                baseSize * pulseScale
              );
              
              // 更新透明度和发光强度
              const opacity = Math.max(0, 1 - elapsed * 2);
              const emissiveIntensity = Math.max(0, 1 - elapsed * 1.5);
              
              (particle.material as THREE.MeshPhysicalMaterial).opacity = opacity;
              (particle.material as THREE.MeshPhysicalMaterial).emissiveIntensity = emissiveIntensity;
              
              if (opacity > 0) {
                allEffectsComplete = false;
              }
            }
          }
        });
        
        // 更新所有光束
        lightBeamsRef.current.forEach((beam) => {
          if (beam) {
            const elapsed = (Date.now() - beam.userData.startTime) / 1000;
            
            // 光束摆动效果
            beam.rotation.x = beam.userData.originalRotation.x + Math.sin(elapsed * 10) * 0.2;
            beam.rotation.y = beam.userData.originalRotation.y + Math.cos(elapsed * 10) * 0.2;
            beam.rotation.z = beam.userData.originalRotation.z + Math.sin(elapsed * 8) * 0.2;
            
            // 光束淡出效果
            const opacity = Math.max(0, 1 - elapsed * 2.5);
            (beam.material as THREE.MeshBasicMaterial).opacity = opacity;
            
            // 光束长度变化
            const scale = Math.max(0.1, 1 - elapsed * 0.5);
            beam.scale.y = scale;
            
            if (opacity > 0) {
              allEffectsComplete = false;
            }
          }
        });
        
        if (allEffectsComplete) {
          setShouldComplete(true);
        }
      }
    }
  });
  
  return (
    <group ref={groupRef} position={position} />
  );
};

// 武器模型组件
const WeaponModel: React.FC = () => {
  const weaponRef = useRef<THREE.Group>(null);
  const { selectedWeapon } = useWeaponStore();
  const [isSwinging, setIsSwinging] = useState(false);
  const [swingProgress, setSwingProgress] = useState(0);
  
  // 处理武器挥舞动画
  useEffect(() => {
    const handleClick = () => {
      if (!isSwinging) {
        setIsSwinging(true);
        setSwingProgress(0);
        
        // 动画持续时间
        const animationTime = 0.3;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min(elapsed / animationTime, 1);
          
          setSwingProgress(progress);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setIsSwinging(false);
            setSwingProgress(0);
          }
        };
        
        animate();
      }
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isSwinging]);
  
  // 更新武器位置和旋转
  useFrame(() => {
    if (weaponRef.current) {
      // 基础位置
      weaponRef.current.position.set(1.5, 0, 2);
      
      // 挥舞动画
      if (isSwinging) {
        // 使用正弦函数创建挥舞效果
        const swingAngle = Math.sin(swingProgress * Math.PI * 2) * Math.PI / 2;
        weaponRef.current.rotation.z = swingAngle;
      } else {
        // 静止位置
        weaponRef.current.rotation.z = 0;
      }
    }
  });
  

  
  // 根据武器类型渲染不同的模型
  const renderWeapon = () => {
    switch (selectedWeapon) {
      case 'whip':
        return (
          <group>
            {/* 鞭子手柄 */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
              <meshStandardMaterial color="#8b4513" roughness={0.8} metalness={0.2} />
            </mesh>
            {/* 鞭子主体 */}
            <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.05, 0.02, 2, 16]} />
              <meshStandardMaterial color="#ff0000" roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        );
      case 'ruler':
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.5, 1.5]} />
            <meshStandardMaterial color="#d2b48c" roughness={0.8} metalness={0.2} />
          </mesh>
        );
      case 'feather':
        return (
          <group>
            {/* 羽毛手柄 */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <meshStandardMaterial color="#8b4513" roughness={0.8} metalness={0.2} />
            </mesh>
            {/* 羽毛 */}
            <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
              <boxGeometry args={[0.3, 0.1, 1]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            </mesh>
          </group>
        );
      case 'hail':
        return (
          <group>
            {/* 冰雹发射器 */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#00ffff" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* 冰雹粒子 */}
            {[...Array(5)].map((_, i) => (
              <mesh key={i} castShadow receiveShadow position={[Math.sin(i) * 0.5, Math.cos(i) * 0.5, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.9} />
              </mesh>
            ))}
          </group>
        );
      case 'candy':
        return (
          <group>
            {/* 糖果棒 */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
              <meshStandardMaterial color="#ff00ff" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* 糖果装饰 - 向上排列 */}
            {[...Array(3)].map((_, i) => (
              <mesh key={i} castShadow receiveShadow position={[0, 0.2 + i * 0.2, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color={['#ff0000', '#00ff00', '#0000ff'][i]} roughness={0.3} metalness={0.7} />
              </mesh>
            ))}
          </group>
        );
      case 'magicbook':
        return (
          <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1.5, 0.1, 1]} />
            <meshStandardMaterial color="#800080" roughness={0.8} metalness={0.2} />
          </mesh>
        );
      default:
        return (
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
            <meshStandardMaterial color="#ff0000" roughness={0.3} metalness={0.7} />
          </mesh>
        );
    }
  };
  
  return (
    <group ref={weaponRef}>
      {renderWeapon()}
    </group>
  );
};

// 击打特效管理器 - 修复无限循环问题
const HitEffects: React.FC = () => {
  const { weapons } = useWeaponStore();
  const [effects, setEffects] = useState<Array<{ id: string; position: THREE.Vector3; color: string }>>([]);
  const processedEffectIdsRef = useRef<Set<string>>(new Set());
  
  // 监听击打事件，添加特效
  useEffect(() => {
    // 使用Zustand的subscribe方法监听状态变化
    const unsubscribe = usePhysicsStore.subscribe(
      (state, prevState) => {
        // 只在hitRecords变化时处理
        if (state.hitRecords !== prevState.hitRecords) {
          // 找到新增的击打记录
          const newRecords = state.hitRecords.filter(
            record => !prevState.hitRecords.find(prev => prev.id === record.id)
          );
          
          // 处理新增的记录
          newRecords.forEach(record => {
            if (!processedEffectIdsRef.current.has(record.id)) {
              processedEffectIdsRef.current.add(record.id);
              const weapon = weapons.find(w => w.id === record.weaponId);
              
              // 添加新的特效
              setEffects(prev => [...prev, {
                id: record.id,
                position: new THREE.Vector3(record.position.x, record.position.y, record.position.z),
                color: weapon?.animationConfig.color || '#ff0000'
              }]);
            }
          });
        }
      }
    );
    
    return () => unsubscribe();
  }, [weapons]);
  
  // 移除特效
  const removeEffect = (id: string) => {
    setEffects(prev => prev.filter(effect => effect.id !== id));
  };
  
  return (
    <>
      {effects.map(effect => (
        <HitEffect
          key={effect.id}
          position={effect.position}
          color={effect.color}
          onComplete={() => removeEffect(effect.id)}
        />
      ))}
    </>
  );
};

// AI模型组件
const AIModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const { aiEmotion } = usePhysicsStore();
  const { selectedWeapon, weapons } = useWeaponStore();
  const [isHit, setIsHit] = useState(false);
  const [hitIntensity, setHitIntensity] = useState(0);
  
  // 处理鼠标点击事件
  useEffect(() => {
    const handleClick = () => {
      const weapon = weapons.find(w => w.id === selectedWeapon);
      
      if (weapon) {
        const power = 10 + Math.random() * 20;
        
        // 添加击打记录 - 调整击打位置，使其看起来像是从前方击打
        usePhysicsStore.getState().addHitRecord({
          weaponId: selectedWeapon,
          power: power,
          position: { x: 0, y: 1, z: 1.5 } // 调整y和z坐标，使其看起来像是从上方和前方击打
        });
        
        // 击打动画
        setIsHit(true);
        setHitIntensity(1);
        
        // 淡出击打强度
        const fadeOut = setInterval(() => {
          setHitIntensity(prev => {
            const newIntensity = prev * 0.9;
            if (newIntensity < 0.1) {
              setIsHit(false);
              clearInterval(fadeOut);
              return 0;
            }
            return newIntensity;
          });
        }, 50);
        
        // 简单的特效动画
        if (groupRef.current) {
          const originalPosition = groupRef.current.position.clone();
          const animationTime = 0.3;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / animationTime, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            groupRef.current!.position.y = originalPosition.y + Math.sin(easeOut * Math.PI) * 0.2;
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              groupRef.current!.position.copy(originalPosition);
            }
          };
          
          animate();
        }
      }
    };
    
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [selectedWeapon, weapons]);
  
  // 持续动画
  useFrame(() => {
    const time = Date.now() * 0.001;
    
    // 呼吸动画 - 身体上下起伏和缩放
    if (groupRef.current) {
      const breatheOffset = Math.sin(time * 1.8) * 0.06;
      const breatheScale = 1 + Math.sin(time * 1.8 + Math.PI / 2) * 0.03;
      groupRef.current.position.y = breatheOffset;
      groupRef.current.scale.set(breatheScale, breatheScale, breatheScale);
    }
    
    // 头部动画 - 更丰富的表情变化
    if (headRef.current) {
      // 轻微的头部转动和倾斜
      headRef.current.rotation.y = Math.sin(time * 0.6) * 0.18;
      headRef.current.rotation.x = Math.cos(time * 0.8) * 0.12;
      
      // 击打时的头部反应 - 更强烈的动画
      if (isHit) {
        const hitShake = Math.sin(time * 15) * 0.15 * hitIntensity;
        headRef.current.rotation.z = hitShake;
        // 头部缩放反应
        const hitScale = 1 + Math.sin(time * 20) * 0.1 * hitIntensity;
        headRef.current.scale.set(hitScale, hitScale, hitScale);
      } else {
        // 恢复正常缩放
        headRef.current.scale.set(1, 1, 1);
      }
    }
    
    // 眼睛动画 - 更丰富的效果
    if (leftEyeRef.current && rightEyeRef.current) {
      // 基本情绪缩放
      const baseEyeScale = aiEmotion === 'pain' ? 1.3 : aiEmotion === 'beg' ? 0.7 : 1;
      // 动态眨眼效果
      const blinkOffset = Math.sin(time * 5) > 0.95 ? 0.3 : 1;
      // 击打时的眼睛反应
      const hitEyeScale = isHit ? Math.sin(time * 20) * 0.2 * hitIntensity + 1 : 1;
      const finalEyeScale = baseEyeScale * blinkOffset * hitEyeScale;
      
      leftEyeRef.current.scale.set(finalEyeScale, finalEyeScale, finalEyeScale);
      rightEyeRef.current.scale.set(finalEyeScale, finalEyeScale, finalEyeScale);
      
      // 眼睛转动效果
      const eyeRotationX = Math.sin(time * 0.5) * 0.15;
      const eyeRotationY = Math.cos(time * 0.7) * 0.15;
      leftEyeRef.current.rotation.set(eyeRotationX, eyeRotationY, 0);
      rightEyeRef.current.rotation.set(eyeRotationX, eyeRotationY, 0);
    }
    
    // 手臂摆动 - 更自然的摆动
    if (leftArmRef.current && rightArmRef.current) {
      // 正常摆动 - 更流畅的动画
      const armSwingOffset = Math.sin(time * 1.6);
      const armSwingVariation = Math.sin(time * 0.9) * 0.1;
      
      leftArmRef.current.rotation.z = armSwingOffset * 0.4 + armSwingVariation;
      rightArmRef.current.rotation.z = -armSwingOffset * 0.4 - armSwingVariation;
      
      // 击打时的手臂反应 - 更强烈的动作
      if (isHit) {
        const hitArmOffset = Math.sin(time * 18) * 0.25 * hitIntensity;
        leftArmRef.current.rotation.z += hitArmOffset;
        rightArmRef.current.rotation.z += Math.cos(time * 18) * 0.25 * hitIntensity;
        
        // 手臂缩放效果
        const hitArmScale = 1 + Math.sin(time * 25) * 0.1 * hitIntensity;
        leftArmRef.current.scale.set(hitArmScale, hitArmScale, hitArmScale);
        rightArmRef.current.scale.set(hitArmScale, hitArmScale, hitArmScale);
      } else {
        // 恢复正常手臂缩放
        leftArmRef.current.scale.set(1, 1, 1);
        rightArmRef.current.scale.set(1, 1, 1);
      }
    }
    
    // 击打时的全身颤抖效果 - 更强烈
    if (groupRef.current && isHit) {
      const bodyShakeX = Math.sin(time * 25) * 0.12 * hitIntensity;
      const bodyShakeZ = Math.cos(time * 22) * 0.12 * hitIntensity;
      groupRef.current.position.x = bodyShakeX;
      groupRef.current.position.z = bodyShakeZ;
    } else if (groupRef.current) {
      // 恢复正常位置
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
    }
    
    // 天线动画 - 轻微摆动
    const antennaMesh = groupRef.current?.children.find(child => child.userData?.type === 'antenna');
    if (antennaMesh) {
      antennaMesh.rotation.x = Math.sin(time * 2) * 0.1;
      antennaMesh.rotation.z = Math.cos(time * 2.5) * 0.1;
    }
    
    // 新添加：腿部摆动动画 - 更自然的站立姿态
    const leftLegMesh = groupRef.current?.children.find(child => child.userData?.type === 'left-leg');
    const rightLegMesh = groupRef.current?.children.find(child => child.userData?.type === 'right-leg');
    
    if (leftLegMesh) {
      leftLegMesh.rotation.z = Math.sin(time * 1.2) * 0.15;
    }
    
    if (rightLegMesh) {
      rightLegMesh.rotation.z = -Math.sin(time * 1.2) * 0.15;
    }
    
    // 新添加：手指动画 - 轻微弯曲
    const leftFingerMeshes = groupRef.current?.children.filter(child => child.userData?.type === 'left-finger') || [];
    const rightFingerMeshes = groupRef.current?.children.filter(child => child.userData?.type === 'right-finger') || [];
    
    leftFingerMeshes.forEach((mesh, index) => {
      mesh.rotation.x = Math.sin(time * 2 + index) * 0.2;
    });
    
    rightFingerMeshes.forEach((mesh, index) => {
      mesh.rotation.x = Math.sin(time * 2 + index) * 0.2;
    });
  });
  
  // 根据情绪获取颜色
  const getBodyColor = () => {
    // 基础颜色 - 使用更丰富的渐变和色调
    const baseColor = aiEmotion === 'pain' ? '#ff4444' : aiEmotion === 'beg' ? '#ffdd66' : '#44aaff';
    
    // 添加击打时的颜色变化
    if (isHit) {
      const hitColor = new THREE.Color(baseColor);
      const flashColor = new THREE.Color('#ff2222');
      return hitColor.lerp(flashColor, hitIntensity * 0.5).getStyle();
    }
    
    return baseColor;
  };
  
  const bodyColor = getBodyColor();
  const eyeColor = aiEmotion === 'pain' ? '#ff0000' : aiEmotion === 'beg' ? '#ffcc00' : '#00ff88';
  const accentColor = '#ffaa00';
  const glowColor = aiEmotion === 'pain' ? '#ff8888' : aiEmotion === 'beg' ? '#ffff88' : '#88ffff';
  
  return (
    <group ref={groupRef} castShadow receiveShadow scale={1.5}>
      {/* 身体核心 - 添加发光效果 */}
      <mesh 
        position={[0, 0, 0]} 
        castShadow 
        receiveShadow
      >
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial 
          color={glowColor} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      
      {/* 身体 */}
      <mesh 
        ref={bodyRef} 
        position={[0, 0, 0]} 
        castShadow 
        receiveShadow
      >
        <cylinderGeometry args={[1.2, 1.5, 3, 24]} />
        <meshStandardMaterial 
          color={bodyColor} 
          roughness={0.2} 
          metalness={0.8} 
        />
      </mesh>
      
      {/* 身体装饰环 - 改进设计 */}
      {[0, 0.8, -0.8].map((y, index) => (
        <group key={`ring-${index}`} position={[0, y, 0]}>
          <mesh castShadow receiveShadow>
            <torusGeometry args={[1.2 + index * 0.1, 0.12, 16, 32]} />
            <meshPhysicalMaterial 
              color={accentColor} 
              roughness={0.1} 
              metalness={0.9} 
              emissive={accentColor}
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* 装饰环上的发光点 */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh 
                key={`ring-point-${i}`} 
                position={[
                  Math.cos(angle) * (1.2 + index * 0.1),
                  0,
                  Math.sin(angle) * (1.2 + index * 0.1)
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial 
                  color={accentColor} 
                  transparent 
                  opacity={0.8} 
                />
              </mesh>
            );
          })}
        </group>
      ))}
      
      {/* 胸部显示屏 - 改进设计 */}
      <group position={[0, 0, 1.4]}>
        {/* 显示屏边框 */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.9, 0.15]} />
          <meshPhysicalMaterial 
            color="#222" 
            roughness={0.1} 
            metalness={0.95} 
            clearcoat={1.0}
          />
        </mesh>
        {/* 显示屏发光区域 */}
        <mesh position={[0, 0, 0.08]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.7, 0.05]} />
          <meshStandardMaterial 
            color={eyeColor} 
            roughness={0} 
            metalness={1} 
            emissive={eyeColor} 
            emissiveIntensity={0.7} 
          />
        </mesh>
        {/* 显示屏装饰线条 */}
        <mesh position={[0, 0.3, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.02]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        <mesh position={[0, -0.3, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.02]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>
      
      {/* 头部 - 改进设计 */}
      <group>
        {/* 头部核心发光效果 */}
        <mesh 
          position={[0, 1.8, 0]} 
        >
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshBasicMaterial 
            color={glowColor} 
            transparent 
            opacity={0.4} 
          />
        </mesh>
        
        {/* 头部主体 */}
        <mesh 
          ref={headRef} 
          position={[0, 1.8, 0]} 
          castShadow 
          receiveShadow
        >
          <octahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.15} 
            metalness={0.85} 
          />
        </mesh>
        
        {/* 头部装饰环 - 改进设计 */}
        <group position={[0, 1.8, 0]}>
          <mesh castShadow receiveShadow>
            <torusGeometry args={[0.9, 0.12, 16, 32]} />
            <meshPhysicalMaterial 
              color={accentColor} 
              roughness={0.1} 
              metalness={0.9} 
              emissive={accentColor}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* 装饰环发光点 */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh 
                key={`head-point-${i}`} 
                position={[
                  Math.cos(angle) * 0.9,
                  Math.sin(angle) * 0.9,
                  0
                ]}
              >
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial 
                  color={accentColor} 
                  transparent 
                  opacity={0.9} 
                />
              </mesh>
            );
          })}
        </group>
        
        {/* 眼睛组件 - 更精致的设计 */}
        <group>
          {/* 眼睛轮廓 - 左 */}
          <mesh 
            position={[-0.45, 2, 0.85]} 
            castShadow 
            receiveShadow
          >
            <torusGeometry args={[0.22, 0.04, 16, 32]} />
            <meshPhysicalMaterial 
              color="#333" 
              roughness={0.1} 
              metalness={0.9} 
            />
          </mesh>
          {/* 眼睛轮廓 - 右 */}
          <mesh 
            position={[0.45, 2, 0.85]} 
            castShadow 
            receiveShadow
          >
            <torusGeometry args={[0.22, 0.04, 16, 32]} />
            <meshPhysicalMaterial 
              color="#333" 
              roughness={0.1} 
              metalness={0.9} 
            />
          </mesh>
          
          {/* 眼睛 - 左 */}
          <mesh 
            ref={leftEyeRef} 
            position={[-0.4, 2, 0.9]} 
            castShadow 
            receiveShadow
          >
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshPhysicalMaterial 
              color={eyeColor} 
              roughness={0} 
              metalness={1} 
              emissive={eyeColor} 
              emissiveIntensity={1.2} 
            />
          </mesh>
          
          {/* 眼睛 - 右 */}
          <mesh 
            ref={rightEyeRef} 
            position={[0.4, 2, 0.9]} 
            castShadow 
            receiveShadow
          >
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshPhysicalMaterial 
              color={eyeColor} 
              roughness={0} 
              metalness={1} 
              emissive={eyeColor} 
              emissiveIntensity={1.2} 
            />
          </mesh>
          
          {/* 眼睛高光 */}
          {[[-0.4, 2, 0.9] as [number, number, number], [0.4, 2, 0.9] as [number, number, number]].map((pos, index) => (
            <group key={`eye-highlight-${index}`} position={pos}>
              {/* 主高光 */}
              <mesh position={[0.08, 0.08, 0.15]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.8} 
                />
              </mesh>
              {/* 次要高光 */}
              <mesh position={[-0.05, -0.05, 0.12]}>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.6} 
                />
              </mesh>
            </group>
          ))}
          
          {/* 眼睛发光效果 - 更强烈 */}
          {[[-0.4, 2, 0.9] as [number, number, number], [0.4, 2, 0.9] as [number, number, number]].map((pos, index) => (
            <mesh 
              key={`eye-glow-${index}`} 
              position={pos} 
              scale={2.5}
            >
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshBasicMaterial 
                color={eyeColor} 
                transparent 
                opacity={0.3} 
              />
            </mesh>
          ))}
        </group>
        
        {/* 嘴巴/传感器 - 新增细节 */}
        <mesh 
          position={[0, 1.7, 0.9]} 
          scale={[0.4, 0.2, 0.1]}
        >
          <boxGeometry args={[1, 0.5, 0.2]} />
          <meshPhysicalMaterial 
            color="#333" 
            roughness={0.1} 
            metalness={0.9} 
          />
        </mesh>
        
        {/* 天线 - 改进设计 */}
        <group>
          {/* 天线底座 */}
          <mesh 
            position={[0, 2.6, 0]} 
            castShadow 
            receiveShadow
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshPhysicalMaterial 
              color={accentColor} 
              roughness={0.1} 
              metalness={0.9} 
              emissive={accentColor}
              emissiveIntensity={0.4}
            />
          </mesh>
          {/* 天线主体 */}
        <mesh 
          position={[0, 3.1, 0]} 
          castShadow 
          receiveShadow
          userData={{ type: 'antenna' }}
        >
          <cylinderGeometry args={[0.06, 0.06, 1.0, 12]} />
          <meshPhysicalMaterial 
            color={accentColor} 
            roughness={0.05} 
            metalness={0.95} 
            clearcoat={1.0}
          />
        </mesh>
          {/* 天线顶部发光球 */}
          <mesh 
            position={[0, 3.6, 0]} 
            castShadow 
            receiveShadow
          >
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshPhysicalMaterial 
              color={accentColor} 
              roughness={0} 
              metalness={1} 
              emissive={accentColor} 
              emissiveIntensity={1.5} 
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* 天线顶部发光效果 */}
          <mesh 
            position={[0, 3.6, 0]} 
            scale={1.8}
          >
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshBasicMaterial 
              color={accentColor} 
              transparent 
              opacity={0.4} 
            />
          </mesh>
        </group>
      </group>
      
      {/* 左臂 - 优化性能 */}
      <group>
        {/* 肩部 */}
        <mesh position={[-1.2, 1.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* 上臂 */}
        <mesh 
          ref={leftArmRef} 
          position={[-2, 1, 0]} 
          castShadow 
          receiveShadow
        >
          <cylinderGeometry args={[0.3, 0.25, 1.5, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 肘部 */}
        <mesh position={[-2.8, 0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* 前臂 */}
        <mesh position={[-3.5, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.2, 1.2, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 手部 */}
        <mesh position={[-4.2, 0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* 手指 - 简化设计 */}
        {[...Array(2)].map((_, i) => (
          <mesh 
            key={`left-finger-${i}`} 
            position={[-4.5, 0.5 + (i - 0.5) * 0.2, 0]} 
            castShadow 
            receiveShadow
          >
            <cylinderGeometry args={[0.08, 0.05, 0.5, 8]} />
            <meshStandardMaterial 
              color={accentColor} 
              roughness={0.2} 
              metalness={0.8} 
            />
          </mesh>
        ))}
      </group>
      
      {/* 右臂 - 优化性能 */}
      <group>
        {/* 肩部 */}
        <mesh position={[1.2, 1.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* 上臂 */}
        <mesh 
          ref={rightArmRef} 
          position={[2, 1, 0]} 
          castShadow 
          receiveShadow
        >
          <cylinderGeometry args={[0.3, 0.25, 1.5, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 肘部 */}
        <mesh position={[2.8, 0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* 前臂 */}
        <mesh position={[3.5, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.2, 1.2, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 手部 */}
        <mesh position={[4.2, 0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* 手指 - 简化设计 */}
        {[...Array(2)].map((_, i) => (
          <mesh 
            key={`right-finger-${i}`} 
            position={[4.5, 0.5 + (i - 0.5) * 0.2, 0]} 
            castShadow 
            receiveShadow
          >
            <cylinderGeometry args={[0.08, 0.05, 0.5, 8]} />
            <meshStandardMaterial 
              color={accentColor} 
              roughness={0.2} 
              metalness={0.8} 
            />
          </mesh>
        ))}
      </group>
      
      {/* 左腿 - 优化性能 */}
      <group userData={{ type: 'left-leg' }}>
        {/* 髋部 */}
        <mesh position={[-0.6, -0.8, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* 大腿 */}
        <mesh position={[-0.6, -1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.4, 1.4, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 膝盖 */}
        <mesh position={[-0.6, -2.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.15}
          />
        </mesh>
        {/* 小腿 */}
        <mesh position={[-0.6, -3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.35, 1.6, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 脚部 */}
        <group position={[-0.6, -3.8, 0]} rotation={[0, 0, Math.PI / 8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.35, 1.2]} />
            <meshStandardMaterial 
              color={accentColor} 
              roughness={0.1} 
              metalness={0.9} 
              emissive={accentColor}
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* 脚趾 - 简化设计 */}
          {[...Array(2)].map((_, i) => (
            <mesh 
              key={`left-toe-${i}`} 
              position={[-0.6 + 0.6, -3.8 + (i - 0.5) * 0.15, 0]} 
              castShadow 
              receiveShadow
              userData={{ type: 'left-finger' }}
            >
              <cylinderGeometry args={[0.1, 0.07, 0.5, 8]} />
              <meshStandardMaterial 
                color={accentColor} 
                roughness={0.2} 
                metalness={0.8} 
              />
            </mesh>
          ))}
        </group>
      </group>
      
      {/* 右腿 - 优化性能 */}
      <group userData={{ type: 'right-leg' }}>
        {/* 髋部 */}
        <mesh position={[0.6, -0.8, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* 大腿 */}
        <mesh position={[0.6, -1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.4, 1.4, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 膝盖 */}
        <mesh position={[0.6, -2.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color={accentColor} 
            roughness={0.1} 
            metalness={0.9} 
            emissive={accentColor}
            emissiveIntensity={0.15}
          />
        </mesh>
        {/* 小腿 */}
        <mesh position={[0.6, -3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.35, 1.6, 16]} />
          <meshStandardMaterial 
            color={bodyColor} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        {/* 脚部 */}
        <group position={[0.6, -3.8, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.35, 1.2]} />
            <meshStandardMaterial 
              color={accentColor} 
              roughness={0.1} 
              metalness={0.9} 
              emissive={accentColor}
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* 脚趾 - 简化设计 */}
          {[...Array(2)].map((_, i) => (
            <mesh 
              key={`right-toe-${i}`} 
              position={[0.6 + 0.6, -3.8 + (i - 0.5) * 0.15, 0]} 
              castShadow 
              receiveShadow
              userData={{ type: 'right-finger' }}
            >
              <cylinderGeometry args={[0.1, 0.07, 0.5, 8]} />
              <meshStandardMaterial 
                color={accentColor} 
                roughness={0.2} 
                metalness={0.8} 
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// 环境装饰组件 - 优化设计
const EnvironmentDecorations: React.FC = () => {
  return (
    <group>
      {/* 地面 - 改进设计 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#111111" 
          roughness={0.9} 
          metalness={0.1} 
        />
      </mesh>
      
      {/* 地面网格线 */}
      <gridHelper args={[20, 20, '#333333', '#111111']} position={[0, -2.49, 0]} />
      
      {/* 背景墙 - 改进设计 */}
      <mesh position={[0, 0, -12]} receiveShadow>
        <planeGeometry args={[40, 15]} />
        <meshStandardMaterial 
          color="#222222" 
          roughness={0.95} 
          metalness={0.05} 
        />
      </mesh>
      
      {/* 背景光效 */}
      <mesh position={[0, 0, -11.9]} receiveShadow>
        <planeGeometry args={[35, 12]} />
        <meshBasicMaterial 
          color="#003366" 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      
      {/* 装饰性柱子 - 简化设计 */}
      {[...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 10;
        return (
          <group key={i} position={[
            Math.cos(angle) * radius,
            -1.5,
            Math.sin(angle) * radius
          ]}>
            <mesh 
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[0.6, 0.6, 4, 16]} />
              <meshStandardMaterial 
                color="#555555" 
                roughness={0.6} 
                metalness={0.4} 
              />
            </mesh>
            {/* 柱子顶部装饰 */}
            <mesh 
              position={[0, 2, 0]} 
              castShadow 
              receiveShadow
            >
              <coneGeometry args={[0.8, 1, 16]} />
              <meshStandardMaterial 
                color="#666666" 
                roughness={0.5} 
                metalness={0.5} 
              />
            </mesh>
          </group>
        );
      })}
      
      {/* 装饰性立方体 - 简化设计 */}
      {[...Array(2)].map((_, i) => {
        const colors = ['#ff6666', '#66ff66'];
        return (
          <mesh 
            key={`cube-${i}`}
            position={[8 - i * 8, -2, -5]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial 
              color={colors[i]} 
              roughness={0.4} 
              metalness={0.6} 
              emissive={colors[i]}
              emissiveIntensity={0.1}
            />
          </mesh>
        );
      })}
      
      {/* 装饰性球体 - 简化设计 */}
      {[...Array(2)].map((_, i) => {
        const colors = ['#4444ff', '#ffaa00'];
        return (
          <mesh 
            key={`sphere-${i}`}
            position={[-8 + i * 8, -1.8, 5]}
            castShadow 
            receiveShadow
          >
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial 
              color={colors[i]} 
              roughness={0.3} 
              metalness={0.7} 
              emissive={colors[i]}
              emissiveIntensity={0.15}
            />
          </mesh>
        );
      })}
      
      {/* 动态粒子背景 - 简化 */}
      <group position={[0, 0, -11]}>
        {[...Array(10)].map((_, i) => (
          <mesh 
            key={`bg-particle-${i}`}
            position={[
              (Math.random() - 0.5) * 30,
              (Math.random() - 0.5) * 10,
              0
            ]}
          >
            <sphereGeometry args={[0.1 + Math.random() * 0.2, 6, 6]} />
            <meshBasicMaterial 
              color={['#ff4444', '#44ff44', '#4444ff'][Math.floor(Math.random() * 3)]} 
              transparent 
              opacity={0.3 + Math.random() * 0.3} 
            />
          </mesh>
        ))}
      </group>
      
      {/* 优化的光源系统 */}
      {/* 主光源 - 降低阴影分辨率 */}
      <directionalLight
        position={[15, 20, 15]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#ffffff"
      />
      {/* 辅助光源 - 减少数量 */}
      <pointLight 
        position={[15, 15, 15]} 
        intensity={0.5} 
        color="#ffaa44"
        distance={25}
      />
      <pointLight 
        position={[-15, 15, -15]} 
        intensity={0.3} 
        color="#44aaff"
        distance={25}
      />
    </group>
  );
};

// 鞭打场景组件
const WhippingScene: React.FC = () => {
  return (
    <div className="whipping-scene-wrapper">
      <Canvas 
        shadows 
        className="whipping-canvas"
        camera={{ position: [0, 1, 5], fov: 75 }}
      >
        {/* 环境光源 */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* 场景元素 */}
        <AIModel />
        <WeaponModel />
        <HitEffects />
        <EnvironmentDecorations />
        
        {/* 网格辅助线 */}
        {/* <gridHelper args={[10, 10, '#444444', '#222222']} /> */}
        
        {/* 相机控制 */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          minDistance={3}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      <WeaponSelector />
    </div>
  );
};

export default WhippingScene;
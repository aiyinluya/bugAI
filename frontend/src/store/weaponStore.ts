import { create } from 'zustand';

// 武器类型定义
export interface Weapon {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  animationConfig: any;
  soundEffect: string;
  icon: string;
}

// 武器库状态定义
interface WeaponStore {
  weapons: Weapon[];
  selectedWeapon: string;
  setSelectedWeapon: (weaponId: string) => void;
  unlockWeapon: (weaponId: string) => void;
}

// 初始武器列表
const initialWeapons: Weapon[] = [
  {
    id: 'whip',
    name: '皮鞭',
    description: '经典鞭打音效，留下红色痕迹',
    unlockLevel: 1,
    animationConfig: { type: 'swing', color: '#ff0000' },
    soundEffect: 'whip-sound.mp3',
    icon: '🪓'
  },
  {
    id: 'ruler',
    name: '戒尺',
    description: '打手心音效，显示肿胀效果',
    unlockLevel: 1,
    animationConfig: { type: 'tap', color: '#8b4513' },
    soundEffect: 'ruler-sound.mp3',
    icon: '📏'
  },
  {
    id: 'feather',
    name: '羽毛',
    description: '挠痒痒音效，AI抖动大笑',
    unlockLevel: 1,
    animationConfig: { type: 'tickles', color: '#ffffff' },
    soundEffect: 'feather-sound.mp3',
    icon: '🪶'
  },
  {
    id: 'hail',
    name: '冰雹',
    description: '冰冻特效，AI结冰颤抖',
    unlockLevel: 3,
    animationConfig: { type: 'freeze', color: '#00ffff' },
    soundEffect: 'hail-sound.mp3',
    icon: '❄️'
  },
  {
    id: 'candy',
    name: '彩虹糖',
    description: '甜蜜攻击，AI变彩色',
    unlockLevel: 5,
    animationConfig: { type: 'color', color: '#ff00ff' },
    soundEffect: 'candy-sound.mp3',
    icon: '🍬'
  },
  {
    id: 'magicbook',
    name: '魔法书',
    description: '施法特效，AI变青蛙',
    unlockLevel: 7,
    animationConfig: { type: 'transform', color: '#800080' },
    soundEffect: 'magic-sound.mp3',
    icon: '📚'
  }
];

// 创建武器库状态管理
export const useWeaponStore = create<WeaponStore>((set) => ({
  weapons: initialWeapons,
  selectedWeapon: 'whip',
  setSelectedWeapon: (weaponId) => set({ selectedWeapon: weaponId }),
  unlockWeapon: (weaponId) => set((state) => ({
    weapons: state.weapons.map(weapon => 
      weapon.id === weaponId ? { ...weapon, unlockLevel: 1 } : weapon
    )
  }))
}));
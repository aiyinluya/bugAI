import { create } from 'zustand';

// AI状态类型
export type AIEmotion = 'confused' | 'pain' | 'beg' | 'smile';

// 击打记录类型
export interface HitRecord {
  id: string;
  weaponId: string;
  power: number;
  position: { x: number; y: number; z: number };
  timestamp: number;
}

// 物理反馈系统状态
export interface PhysicsStore {
  hitRecords: HitRecord[];
  comboCount: number;
  comboTimer: number | NodeJS.Timeout | null;
  aiEmotion: AIEmotion;
  aiHealth: number;
  addHitRecord: (record: Omit<HitRecord, 'id' | 'timestamp'>) => void;
  resetCombo: () => void;
  updateAIEmotion: (emotion: AIEmotion) => void;
  updateAIHealth: (change: number) => void;
  clearHitRecords: () => void;
}

// 创建物理反馈系统状态管理
export const usePhysicsStore = create<PhysicsStore>((set, get) => ({
  hitRecords: [],
  comboCount: 0,
  comboTimer: null,
  aiEmotion: 'confused',
  aiHealth: 100,
  
  addHitRecord: (record) => {
    const newRecord: HitRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    
    // 增加连击计数
    const newComboCount = get().comboCount + 1;
    
    // 更新AI状态
    let newEmotion: AIEmotion = get().aiEmotion;
    if (newComboCount >= 10) {
      newEmotion = 'beg';
    } else if (newComboCount >= 5) {
      newEmotion = 'pain';
    } else if (newComboCount >= 2) {
      newEmotion = 'confused';
    }
    
    // 更新AI健康值
    const healthChange = -record.power * 0.1;
    const newHealth = Math.max(0, Math.min(100, get().aiHealth + healthChange));
    
    // 设置连击计时器
    const timer = get().comboTimer;
    if (timer) {
      clearTimeout(timer);
    }
    
    const newTimer = setTimeout(() => {
      set({ comboCount: 0, comboTimer: null });
    }, 1000);
    
    set({
      hitRecords: [...get().hitRecords, newRecord],
      comboCount: newComboCount,
      comboTimer: newTimer,
      aiEmotion: newEmotion,
      aiHealth: newHealth
    });
  },
  
  resetCombo: () => {
    const timer = get().comboTimer;
    if (timer) {
      clearTimeout(timer);
    }
    set({ comboCount: 0, comboTimer: null });
  },
  
  updateAIEmotion: (emotion) => set({ aiEmotion: emotion }),
  
  updateAIHealth: (change) => set((state) => ({
    aiHealth: Math.max(0, Math.min(100, state.aiHealth + change))
  })),
  
  clearHitRecords: () => set({ hitRecords: [] })
}));
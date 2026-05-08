// ===== 角色相关 =====

// 捏人参数 - 中等定制程度，存为JSON
export interface CharacterParams {
  gender: 'male' | 'female';               // 性别
  body: {
    height: 'short' | 'medium' | 'tall';   // 身高三档
    shape: 'slim' | 'standard' | 'plump';  // 体型三档
  };
  face: 'round' | 'oval' | 'square' | 'heart';  // 脸型四选一
  eyes: 'almond' | 'phoenix' | 'peach';         // 眼型三选一
  eyebrows: 'willow' | 'flat' | 'arched';       // 眉型三选一
  mouth: 'thin' | 'standard' | 'thick';         // 嘴型三选一
  skin_tone: 'fair' | 'natural' | 'wheat' | 'deep';  // 肤色四选一
  hair: { front: string; back: string };  // 前后发模板ID
}

// ===== 服装相关 =====

// 服装大分类
export type GarmentCategory =
  | 'top' | 'bottom' | 'dress' | 'shoes' | 'socks' | 'accessory' | 'hair';

// 部件类型 - 决定在单件渲染管线中的哪一步绘制
export type PartType =
  | 'base_shape'   // 基布（完整轮廓）
  | 'collar'       // 领口覆层
  | 'sleeve'       // 袖型覆层
  | 'hem'          // 下摆覆层
  | 'pattern'      // 图案印花
  | 'decoration'   // 装饰配件
  | 'texture';     // 材质纹理

// 穿戴条目 - characters.wearing JSON 数组的元素
export interface WearingEntry {
  item_id: string;
  color_overrides: Record<string, string>;  // { "main_body": "#ff6b6b", "collar": "#fff" }
}

// ===== 骨骼相关 =====

// 16个骨骼锚点名称
export type BoneName =
  | 'head' | 'neck'
  | 'left_shoulder' | 'right_shoulder'
  | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist'
  | 'chest' | 'waist'
  | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee'
  | 'left_ankle' | 'right_ankle';

// 单个骨骼的像素坐标
export interface BoneCoords { x: number; y: number; }

// 完整骨骼集 - 键为骨骼名，值为坐标
export type Skeleton = Record<BoneName, BoneCoords>;

// ===== 编辑器相关 =====

// 编辑器中的一个部件（带客户端临时ID）
export interface EditorPart {
  id: string;             // 客户端临时ID
  partType: PartType;
  templateId: string;     // 系统部件模板ID
  textureUrl?: string;
  boneAnchor: BoneName;
  offsetX: number; offsetY: number;
  scaleX: number; scaleY: number;
  rotation: number;
  colorHex?: string;
  zOrder: number;
}

// 提交给后端的服装创作数据
export interface DesignSubmission {
  name: string;
  category: GarmentCategory;
  previewThumbnail: string;  // base64 缩略图
  parts: Omit<EditorPart, 'id'>[];
}

// ===== 论坛相关 =====

export interface PostData {
  id: string;
  title: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  user: { id: string; username: string };
  _count: { likes: number; comments: number };
  likedByMe?: boolean;
}

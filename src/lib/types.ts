// ── 类型定义（中文注释）─────────────────────────────

/**
 * 捏人参数
 * 控制角色外观的所有可定制属性
 */
export interface CharacterParams {
  gender: string;
  body: {
    height: number;         // 身高比例 0~1
    shape: 'thin' | 'average' | 'curvy';  // 体型
  };
  face: string;             // 脸型模板 ID
  eyes: string;             // 眼睛模板 ID
  eyebrows: string;         // 眉毛模板 ID
  mouth: string;            // 嘴巴模板 ID
  skin_tone: string;        // 肤色 hex / 模板 ID
  hair: {
    front: string;          // 前发模板 ID
    back: string;           // 后发模板 ID
  };
}

/**
 * 服装分类联合类型
 * 与 Prisma enum GarmentCategory 对应（均为小写）
 */
export type GarmentCategory =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'shoes'
  | 'socks'
  | 'accessory'
  | 'hair';

/**
 * 服装部件类型
 * 描述部件在服装中的角色
 */
export type PartType =
  | 'base_shape'  // 基础形状
  | 'collar'      // 领口
  | 'sleeve'      // 袖子
  | 'hem'         // 下摆
  | 'pattern'     // 图案
  | 'decoration'  // 装饰物
  | 'texture';    // 纹理

/**
 * 穿戴条目（角色当前穿着的某件物品）
 */
export interface WearingEntry {
  item_id: number;
  color_overrides?: Record<string, string>;  // 部件颜色覆盖
}

/**
 * 骨骼名称（17 个关键骨骼点）
 */
export type BoneName =
  | 'head'
  | 'neck'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_arm'
  | 'right_arm'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_hand'
  | 'right_hand'
  | 'torso'
  | 'hip'
  | 'left_leg'
  | 'right_leg'
  | 'left_knee'
  | 'right_knee'
  | 'left_foot'
  | 'right_foot';

/**
 * 骨骼坐标（相对于画布原点）
 */
export interface BoneCoords {
  x: number;
  y: number;
}

/**
 * 完整骨骼数据
 */
export type Skeleton = Record<BoneName, BoneCoords>;

/**
 * 编辑器中的服装部件
 */
export interface EditorPart {
  id: string;                // 客户端临时 ID
  partType: PartType;        // 部件类型
  templateId: string;        // 模板 ID
  textureUrl?: string;       // 纹理图片 URL
  boneAnchor: BoneName;      // 绑定的骨骼
  offsetX: number;           // X 偏移
  offsetY: number;           // Y 偏移
  scaleX: number;            // X 缩放
  scaleY: number;            // Y 缩放
  rotation: number;          // 旋转角度
  colorHex?: string;         // 颜色 hex（可选）
  zOrder: number;            // 层级顺序
}

/**
 * 设计提交（设计师上传新服装时使用）
 */
export interface DesignSubmission {
  name: string;
  category: GarmentCategory;
  previewThumbnail: string;                  // 预览缩略图 URL
  parts: Omit<EditorPart, 'id'>[];           // 部件列表（无客户端 ID）
}

/**
 * 帖子数据（API 返回的完整帖子信息）
 */
export interface PostData {
  id: number;
  title: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: Date;
  user: {
    id: number;
    username: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  likedByMe?: boolean;  // 当前用户是否已点赞
}

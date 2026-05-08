// scripts/generate-textures.mjs
// 生成系统部件模板占位纹理（30个PNG，512×512，透明背景）
// 后续替换为美术资源
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, '..', 'public', 'assets', 'system');

// SVG → PNG 工具函数
async function svgToPng(svg, outPath) {
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(outPath);
}

// 生成带文字标签的纯色块
function labeledRect(label, fill, stroke = '#555', textColor = '#333') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect x="32" y="32" width="448" height="448" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    <text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="${textColor}">${label}</text>
    <text x="256" y="320" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${textColor}" opacity="0.6">占位纹理</text>
  </svg>`;
}

// ─── base_shape (基布版型) — 服装剪影轮廓 ───
const BASE_SHAPES = {
  'base_tshirt_01':   { label:'T恤',   fill:'#ffffff' },
  'base_shirt_01':    { label:'衬衫',   fill:'#f5f5ff' },
  'base_dress_a_01':  { label:'A字连衣裙', fill:'#fff0f5' },
  'base_hoodie_01':   { label:'卫衣',   fill:'#e8e8e8' },
  'base_jacket_01':   { label:'外套',   fill:'#f0ebe5' },
  'base_jeans_01':    { label:'牛仔裤', fill:'#5b7cb3' },
  'base_skirt_short_01': { label:'A字短裙', fill:'#333333' },
  'base_skirt_long_01':  { label:'百褶长裙', fill:'#2d2d2d' },
};

// ─── collar (领口) — 领口形状 ───
const COLLARS = {
  'collar_round_01':  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><ellipse cx="256" cy="140" rx="140" ry="70" fill="none" stroke="#555" stroke-width="12"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">圆领</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
  'collar_v_01':      '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><polygon points="180,80 332,80 256,200" fill="none" stroke="#555" stroke-width="12" stroke-linejoin="round"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">V领</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
  'collar_square_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect x="176" y="80" width="160" height="80" rx="4" fill="none" stroke="#555" stroke-width="12"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">方领</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
  'collar_high_01':   '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect x="180" y="60" width="152" height="120" rx="8" fill="none" stroke="#555" stroke-width="12"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">高领</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
  'collar_collar_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><polygon points="140,100 220,200 292,200 372,100 320,60 192,60" fill="none" stroke="#555" stroke-width="10" stroke-linejoin="round"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">翻领</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
};

// ─── sleeve (袖型) ───
const SLEEVES = {
  'sleeve_none':     '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#aaa">无袖</text><text x="256" y="320" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#ccc">占位纹理</text></svg>',
  'sleeve_short_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><ellipse cx="210" cy="180" rx="90" ry="110" fill="#f5f5f5" stroke="#999" stroke-width="6"/><text x="256" y="360" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">短袖</text><text x="256" y="410" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
  'sleeve_puff_01':  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><circle cx="210" cy="180" r="120" fill="#fff0f5" stroke="#e8a0b0" stroke-width="6"/><rect x="180" y="280" width="60" height="100" rx="10" fill="#fff0f5" stroke="#e8a0b0" stroke-width="6"/><text x="256" y="440" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="bold" fill="#333">泡泡袖</text></svg>',
  'sleeve_long_01':  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect x="170" y="100" width="80" height="300" rx="20" fill="#f0f0f0" stroke="#999" stroke-width="6"/><text x="256" y="440" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="bold" fill="#333">长袖</text></svg>',
};

// ─── hem (下摆) ───
const HEMS = {
  'hem_straight_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect x="80" y="40" width="352" height="120" rx="8" fill="#f5f5f5" stroke="#999" stroke-width="6"/><line x1="80" y1="160" x2="432" y2="160" stroke="#555" stroke-width="8"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="#333">直筒下摆</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
  'hem_a_01':        '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><polygon points="140,40 372,40 432,160 80,160" fill="#f5f5f5" stroke="#999" stroke-width="6"/><line x1="80" y1="160" x2="432" y2="160" stroke="#555" stroke-width="8"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="#333">A字下摆</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
  'hem_ruffle_01':   '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M80,160 Q110,100 140,160 Q170,100 200,160 Q230,100 260,160 Q290,100 320,160 Q350,100 380,160 Q410,100 432,160" fill="none" stroke="#e8a0b0" stroke-width="8"/><text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="#333">荷叶边下摆</text><text x="256" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">占位纹理</text></svg>',
};

// ─── pattern (图案) — 平铺风格的图案 ───
const PATTERNS = {
  'pat_stripe_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><pattern id="s" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="20" height="40" fill="#4a90d9"/><rect x="20" width="20" height="40" fill="#fff"/></pattern></defs><rect width="512" height="512" fill="url(#s)"/><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="#333" stroke="#fff" stroke-width="2">条纹</text></svg>',
  'pat_plaid_01':  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#cc3333"/><rect width="40" height="80" fill="#ee6666" opacity="0.5"/><rect width="80" height="40" fill="#992222" opacity="0.5"/><line x1="0" y1="40" x2="80" y2="40" stroke="#fff" stroke-width="2" opacity="0.3"/><line x1="40" y1="0" x2="40" y2="80" stroke="#fff" stroke-width="2" opacity="0.3"/></pattern></defs><rect width="512" height="512" fill="url(#p)"/><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="#fff">格子</text></svg>',
  'pat_dot_01':    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><pattern id="d" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#fff"/><circle cx="25" cy="25" r="10" fill="#333"/></pattern></defs><rect width="512" height="512" fill="url(#d)"/><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="#333" stroke="#fff" stroke-width="2">波点</text></svg>',
  'pat_floral_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><pattern id="f" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#fff8f0"/><circle cx="20" cy="20" r="12" fill="#ff9999" opacity="0.7"/><circle cx="60" cy="60" r="10" fill="#ffcccc" opacity="0.7"/><circle cx="20" cy="60" r="8" fill="#ff7777" opacity="0.5"/><circle cx="60" cy="20" r="6" fill="#e8a0b0" opacity="0.6"/></pattern></defs><rect width="512" height="512" fill="url(#f)"/><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="#c44">碎花</text></svg>',
};

// ─── decoration (装饰) — 小装饰元素 ───
const DECORATIONS = {
  'deco_bow_01':    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><ellipse cx="160" cy="200" rx="90" ry="50" fill="#ff9999" stroke="#cc6666" stroke-width="4" transform="rotate(-20 160 200)"/><ellipse cx="352" cy="200" rx="90" ry="50" fill="#ff9999" stroke="#cc6666" stroke-width="4" transform="rotate(20 352 200)"/><circle cx="256" cy="210" r="30" fill="#ff7777" stroke="#cc5555" stroke-width="4"/><text x="256" y="380" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">蝴蝶结</text></svg>',
  'deco_button_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><circle cx="256" cy="140" r="70" fill="#f0e0c0" stroke="#c0a060" stroke-width="6"/><circle cx="256" cy="140" r="20" fill="#d0b080"/><circle cx="245" cy="132" r="6" fill="#c0a060"/><circle cx="267" cy="132" r="6" fill="#c0a060"/><circle cx="245" cy="148" r="6" fill="#c0a060"/><circle cx="267" cy="148" r="6" fill="#c0a060"/><text x="256" y="340" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#333">纽扣</text></svg>',
  'deco_lace_01':   '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M20,100 Q80,120 130,100 Q180,120 230,100 Q280,120 330,100 Q380,120 430,100 Q480,120 492,100" fill="none" stroke="#ffcccc" stroke-width="8"/><path d="M20,120 Q80,140 130,120 Q180,140 230,120 Q280,140 330,120 Q380,140 430,120 Q480,140 492,120" fill="none" stroke="#ffdddd" stroke-width="6"/><path d="M20,140 Q80,160 130,140 Q180,160 230,140 Q280,160 330,140 Q380,160 430,140 Q480,160 492,140" fill="none" stroke="#ffcccc" stroke-width="4"/><text x="256" y="340" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#c88">蕾丝边</text></svg>',
};

// ─── texture (材质) — 材质纹理 ───
const TEXTURES = {
  'tex_cotton_01': '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#fafaf5"/><line x1="0" y1="0" x2="4" y2="4" stroke="#e8e8dd" stroke-width="1"/><line x1="4" y1="0" x2="0" y2="4" stroke="#e8e8dd" stroke-width="1"/><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#999">棉布</text><text x="256" y="320" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#ccc">材质占位</text></svg>',
  'tex_denim_01':  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#5b7cb3"/><line x1="0" y1="8" x2="512" y2="8" stroke="#4a6b9e" stroke-width="2"/><line x1="0" y1="16" x2="512" y2="16" stroke="#6b8cc8" stroke-width="1"/><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#fff">牛仔</text><text x="256" y="320" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#dde">材质占位</text></svg>',
  'tex_silk_01':   '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="sg" x1="0" y1="0" x2="512" y2="512"><stop offset="0%" stop-color="#ffe0e0"/><stop offset="50%" stop-color="#ffe8f0"/><stop offset="100%" stop-color="#ffd0d0"/></linearGradient></defs><rect width="512" height="512" fill="url(#sg)"/><line x1="0" y1="0" x2="512" y2="512" stroke="#ffcccc" stroke-width="20" opacity="0.3"/><text x="256" y="270" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="#d88">丝绸</text><text x="256" y="320" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#eaa">材质占位</text></svg>',
};

// ─── 额外的种子物品纹理（帆布鞋等） ───
const EXTRAS = {
  'base_canvas_shoe_01': { label:'帆布鞋', fill:'#ffffff', stroke:'#4a90d9' },
};

// 所有纹理映射
const ALL = {
  base_shapes: BASE_SHAPES,
  collars: COLLARS,
  sleeves: SLEEVES,
  hems: HEMS,
  patterns: PATTERNS,
  decorations: DECORATIONS,
  textures: TEXTURES,
};

async function main() {
  for (const [dir, templates] of Object.entries(ALL)) {
    const dirPath = path.join(BASE, dir);
    await mkdir(dirPath, { recursive: true });

    for (const [id, def] of Object.entries(templates)) {
      const outPath = path.join(dirPath, `${id}.png`);
      if (typeof def === 'string') {
        // 自定义 SVG 字符串
        await svgToPng(def, outPath);
      } else {
        // 纯色块 + 标签
        const svg = labeledRect(def.label, def.fill, def.stroke || '#555');
        await svgToPng(svg, outPath);
      }
      console.log(`  ✓ ${dir}/${id}.png`);
    }
  }

  // 处理额外的种子物品
  for (const [id, def] of Object.entries(EXTRAS)) {
    // 放入 base_shapes 目录
    const outPath = path.join(BASE, 'base_shapes', `${id}.png`);
    const svg = labeledRect(def.label, def.fill, def.stroke);
    await svgToPng(svg, outPath);
    console.log(`  ✓ base_shapes/${id}.png`);
  }

  console.log(`\n生成完成！共 ${Object.values(ALL).reduce((s, t) => s + Object.keys(t).length, 0) + Object.keys(EXTRAS).length} 个纹理文件`);
}

main().catch(console.error);

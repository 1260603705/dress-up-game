// src/engine/skeleton.test.ts
// ===== 骨骼引擎单元测试 =====

import { describe, it, expect } from 'vitest';
import { computeSkeleton, STANDARD_SKELETON } from './skeleton';
import type { CharacterParams } from '@/lib/types';

describe('骨骼引擎', () => {
  it('标准体型返回标准骨骼坐标', () => {
    const params: CharacterParams = {
      gender: 'male',
      body: { height: 'medium', shape: 'standard' },
      face: 'oval',
      eyes: 'almond',
      eyebrows: 'flat',
      mouth: 'standard',
      skin_tone: 'natural',
      hair: { front: 'default_front', back: 'default_back' },
    };
    const skeleton = computeSkeleton(params);
    expect(skeleton.chest).toEqual(STANDARD_SKELETON.chest);
  });

  it('高身高时Y轴缩放', () => {
    const params: CharacterParams = {
      gender: 'male',
      body: { height: 'tall', shape: 'standard' },
      face: 'oval',
      eyes: 'almond',
      eyebrows: 'flat',
      mouth: 'standard',
      skin_tone: 'natural',
      hair: { front: 'default_front', back: 'default_back' },
    };
    const skeleton = computeSkeleton(params);
    expect(skeleton.chest.y).toBeCloseTo(280 * 1.08, 5);
  });

  it('丰满体型时X轴缩放', () => {
    const params: CharacterParams = {
      gender: 'male',
      body: { height: 'medium', shape: 'plump' },
      face: 'oval',
      eyes: 'almond',
      eyebrows: 'flat',
      mouth: 'standard',
      skin_tone: 'natural',
      hair: { front: 'default_front', back: 'default_back' },
    };
    const skeleton = computeSkeleton(params);
    expect(skeleton.chest.x).toBeCloseTo(512 * 1.12, 5);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBrowserCanvasMaxSize } from './getBrowserCanvasMaxSize';
import canvasSize from 'canvas-size';

vi.mock('canvas-size', () => ({
  default: {
    maxWidth: vi.fn(),
    maxHeight: vi.fn(),
    maxArea: vi.fn()
  }
}));

describe('getBrowserCanvasMaxSize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Clear the cached promise to test multiple scenarios
    (getBrowserCanvasMaxSize as any).__proto__.maxSizePromise = null;
  });

  it('should return canvas max dimensions', async () => {
    vi.mocked(canvasSize.maxWidth).mockResolvedValue({ width: 16384 });
    vi.mocked(canvasSize.maxHeight).mockResolvedValue({ height: 16384 });
    vi.mocked(canvasSize.maxArea).mockResolvedValue({ width: 16384, height: 16384 });

    const result = await getBrowserCanvasMaxSize();

    expect(result).toEqual({
      maxWidth: 16384,
      maxHeight: 16384,
      maxArea: 16384 * 16384
    });

    expect(canvasSize.maxWidth).toHaveBeenCalledWith({ usePromise: true });
    expect(canvasSize.maxHeight).toHaveBeenCalledWith({ usePromise: true });
    expect(canvasSize.maxArea).toHaveBeenCalledWith({ usePromise: true });
  });

  it('should cache the result and not make additional API calls', async () => {
    vi.mocked(canvasSize.maxWidth).mockResolvedValue({ width: 16384 });
    vi.mocked(canvasSize.maxHeight).mockResolvedValue({ height: 16384 });
    vi.mocked(canvasSize.maxArea).mockResolvedValue({ width: 16384, height: 16384 });

    const result1 = await getBrowserCanvasMaxSize();
    vi.clearAllMocks();

    const result2 = await getBrowserCanvasMaxSize();

    expect(result1).toEqual(result2);
    expect(canvasSize.maxWidth).not.toHaveBeenCalled();
    expect(canvasSize.maxHeight).not.toHaveBeenCalled();
    expect(canvasSize.maxArea).not.toHaveBeenCalled();
  });

  it('should handle different canvas size values', async () => {
    // Reset module to clear cached promise
    vi.resetModules();
    const { getBrowserCanvasMaxSize } = await import('./getBrowserCanvasMaxSize');

    vi.mocked(canvasSize.maxWidth).mockResolvedValue({ width: 8192 });
    vi.mocked(canvasSize.maxHeight).mockResolvedValue({ height: 4096 });
    vi.mocked(canvasSize.maxArea).mockResolvedValue({ width: 8192, height: 4096 });

    const result = await getBrowserCanvasMaxSize();

    expect(result).toEqual({
      maxWidth: 8192,
      maxHeight: 4096,
      maxArea: 8192 * 4096
    });
  });

  it('should handle errors from canvas-size API', async () => {
    // Reset module to clear cached promise
    vi.resetModules();
    const { getBrowserCanvasMaxSize } = await import('./getBrowserCanvasMaxSize');

    vi.mocked(canvasSize.maxWidth).mockRejectedValue(new Error('API Error'));
    vi.mocked(canvasSize.maxHeight).mockResolvedValue({ height: 16384 });
    vi.mocked(canvasSize.maxArea).mockResolvedValue({ width: 16384, height: 16384 });

    await expect(getBrowserCanvasMaxSize()).rejects.toThrow('API Error');
  });

  it('should handle zero dimensions', async () => {
    // Reset module to clear cached promise
    vi.resetModules();
    const { getBrowserCanvasMaxSize } = await import('./getBrowserCanvasMaxSize');

    vi.mocked(canvasSize.maxWidth).mockResolvedValue({ width: 0 });
    vi.mocked(canvasSize.maxHeight).mockResolvedValue({ height: 0 });
    vi.mocked(canvasSize.maxArea).mockResolvedValue({ width: 0, height: 0 });

    const result = await getBrowserCanvasMaxSize();

    expect(result).toEqual({
      maxWidth: 0,
      maxHeight: 0,
      maxArea: 0
    });
  });
});

import '@testing-library/jest-dom';

// ResizeObserverのモック
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

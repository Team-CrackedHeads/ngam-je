import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Viewport breakpoints for responsive testing
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  large: { width: 1440, height: 900 }
} as const

export type ViewportSize = keyof typeof VIEWPORT_SIZES

// Mock window.matchMedia for responsive testing
export const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      // Parse media queries for common breakpoints
      const matches = {
        '(max-width: 767px)': width <= 767,
        '(min-width: 768px)': width >= 768,
        '(max-width: 1023px)': width <= 1023,
        '(min-width: 1024px)': width >= 1024,
        '(max-width: 1439px)': width <= 1439,
        '(min-width: 1440px)': width >= 1440,
      }[query] || false

      return {
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }
    },
  })
}

// Set viewport size for testing
export const setViewport = (size: ViewportSize) => {
  const { width, height } = VIEWPORT_SIZES[size]

  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })

  // Mock screen dimensions
  Object.defineProperty(window.screen, 'width', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window.screen, 'height', {
    writable: true,
    configurable: true,
    value: height,
  })

  // Setup matchMedia
  mockMatchMedia(width)

  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
}

// Custom render function with viewport setup
export const renderWithViewport = (
  ui: ReactElement,
  viewport: ViewportSize,
  options?: RenderOptions
) => {
  setViewport(viewport)
  return render(ui, options)
}

// Helper to test component at all viewport sizes
export const testAllViewports = (
  testFn: (viewport: ViewportSize) => void
) => {
  Object.keys(VIEWPORT_SIZES).forEach((size) => {
    testFn(size as ViewportSize)
  })
}
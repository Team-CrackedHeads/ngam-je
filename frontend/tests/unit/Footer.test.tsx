import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'
import Footer from '@/app/components/Footer'
import {
  renderWithViewport,
  testAllViewports,
  type ViewportSize
} from '@/utils/test-utils'

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, className, style, onMouseEnter, onMouseLeave, ...props }: any) => (
    <a
      href={href}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </a>
  ),
}))

const mockUsePathname = vi.mocked(usePathname)

describe('Footer Component', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  describe('Responsive Design Tests', () => {
    it('renders correctly on mobile viewport', () => {
      renderWithViewport(<Footer />, 'mobile')

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()

      // Check that all navigation links are present
      expect(screen.getByText('Threads')).toBeInTheDocument()
      expect(screen.getByText('Messages')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders correctly on tablet viewport', () => {
      renderWithViewport(<Footer />, 'tablet')

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.getAllByRole('link')).toHaveLength(4)
    })

    it('renders correctly on desktop viewport', () => {
      renderWithViewport(<Footer />, 'desktop')

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.getAllByRole('link')).toHaveLength(4)
    })

    it('maintains layout integrity across all viewport sizes', () => {
      testAllViewports((viewport: ViewportSize) => {
        const { container } = renderWithViewport(<Footer />, viewport)

        // Check that footer structure is maintained
        const footer = screen.getByRole('contentinfo')
        const footerContainer = footer.querySelector('div')

        expect(footer).toBeInTheDocument()
        expect(footerContainer).toHaveClass('flex', 'justify-around', 'items-center')

        container.remove()
      })
    })

    it('applies responsive sizing classes correctly', () => {
      testAllViewports((viewport: ViewportSize) => {
        const { container } = renderWithViewport(<Footer />, viewport)

        const footerContainer = screen.getByRole('contentinfo').querySelector('div')
        expect(footerContainer).toHaveClass('h-16', 'sm:h-20')

        container.remove()
      })
    })
  })

  describe('Navigation Functionality Tests', () => {
    it('highlights the current page correctly', () => {
      mockUsePathname.mockReturnValue('/messages')
      renderWithViewport(<Footer />, 'desktop')

      const messagesLink = screen.getByRole('link', { name: /messages/i })
      const threadsLink = screen.getByRole('link', { name: /threads/i })

      // Messages should be active (highlighted)
      expect(messagesLink).toHaveStyle({ backgroundColor: '#F1D688' })
      expect(messagesLink).toHaveStyle({ color: '#242423' })

      // Threads should not be active (no background color set)
      expect(threadsLink).not.toHaveStyle({ backgroundColor: '#F1D688' })
    })

    it('all navigation links have correct href attributes', () => {
      renderWithViewport(<Footer />, 'desktop')

      expect(screen.getByRole('link', { name: /threads/i })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: /messages/i })).toHaveAttribute('href', '/messages')
      expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile')
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings')
    })

    it('displays correct icons for each navigation item', () => {
      renderWithViewport(<Footer />, 'desktop')

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(4)

      // Each link should contain an icon (SVG from lucide-react)
      links.forEach(link => {
        const svg = link.querySelector('svg')
        expect(svg).toBeInTheDocument()
      })
    })

    it('handles navigation between different routes', () => {
      // Test each route
      const routes = ['/', '/messages', '/profile', '/settings']
      const expectedLabels = ['Threads', 'Messages', 'Profile', 'Settings']

      routes.forEach((route, index) => {
        mockUsePathname.mockReturnValue(route)
        const { container } = renderWithViewport(<Footer />, 'desktop')

        const activeLink = screen.getByRole('link', { name: new RegExp(expectedLabels[index], 'i') })
        expect(activeLink).toHaveStyle({ backgroundColor: '#F1D688' })

        container.remove()
      })
    })
  })

  describe('User Interaction Tests', () => {
    it('handles click interactions correctly', async () => {
      const user = userEvent.setup()
      renderWithViewport(<Footer />, 'desktop')

      const messagesLink = screen.getByRole('link', { name: /messages/i })
      await user.click(messagesLink)

      expect(messagesLink).toBeInTheDocument()
    })

    it('handles hover effects for non-active links', () => {
      mockUsePathname.mockReturnValue('/')
      renderWithViewport(<Footer />, 'desktop')

      const messagesLink = screen.getByRole('link', { name: /messages/i })

      // Simulate hover
      fireEvent.mouseEnter(messagesLink)
      expect(messagesLink).toHaveStyle({ backgroundColor: '#CFDBD5' })

      // Simulate mouse leave
      fireEvent.mouseLeave(messagesLink)
      expect(messagesLink).not.toHaveStyle({ backgroundColor: '#CFDBD5' })
    })

    it('does not change hover effect for active link', () => {
      mockUsePathname.mockReturnValue('/messages')
      renderWithViewport(<Footer />, 'desktop')

      const messagesLink = screen.getByRole('link', { name: /messages/i })
      const originalBgColor = '#F1D688'

      expect(messagesLink).toHaveStyle({ backgroundColor: originalBgColor })

      // Hover should not change active link background
      fireEvent.mouseEnter(messagesLink)
      expect(messagesLink).toHaveStyle({ backgroundColor: originalBgColor })

      fireEvent.mouseLeave(messagesLink)
      expect(messagesLink).toHaveStyle({ backgroundColor: originalBgColor })
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper semantic HTML structure', () => {
      renderWithViewport(<Footer />, 'desktop')

      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
      expect(screen.getAllByRole('link')).toHaveLength(4) // navigation links
    })

    it('navigation is keyboard accessible', async () => {
      const user = userEvent.setup()
      renderWithViewport(<Footer />, 'desktop')

      const links = screen.getAllByRole('link')

      // Tab through navigation links
      await user.tab()
      expect(links[0]).toHaveFocus() // Threads

      await user.tab()
      expect(links[1]).toHaveFocus() // Messages

      await user.tab()
      expect(links[2]).toHaveFocus() // Profile

      await user.tab()
      expect(links[3]).toHaveFocus() // Settings
    })

    it('has proper link labels and text content', () => {
      renderWithViewport(<Footer />, 'desktop')

      const threadsLink = screen.getByRole('link', { name: /threads/i })
      const messagesLink = screen.getByRole('link', { name: /messages/i })
      const profileLink = screen.getByRole('link', { name: /profile/i })
      const settingsLink = screen.getByRole('link', { name: /settings/i })

      expect(threadsLink).toHaveTextContent('Threads')
      expect(messagesLink).toHaveTextContent('Messages')
      expect(profileLink).toHaveTextContent('Profile')
      expect(settingsLink).toHaveTextContent('Settings')
    })

    it('provides sufficient touch targets for mobile', () => {
      renderWithViewport(<Footer />, 'mobile')

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveClass('px-3', 'py-1')
      })
    })
  })

  describe('Layout and Styling Tests', () => {
    it('applies correct theme colors', () => {
      renderWithViewport(<Footer />, 'desktop')

      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveStyle({ backgroundColor: '#E8EDDF' })
    })

    it('is positioned as fixed footer', () => {
      renderWithViewport(<Footer />, 'desktop')

      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0')
    })

    it('includes safe area inset for mobile devices', () => {
      renderWithViewport(<Footer />, 'mobile')

      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('pb-[env(safe-area-inset-bottom)]')
    })

    it('applies correct responsive icon and text sizes', () => {
      renderWithViewport(<Footer />, 'desktop')

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        const icon = link.querySelector('svg')
        const text = link.querySelector('span')

        expect(icon).toHaveClass('w-5', 'h-5', 'sm:w-6', 'sm:h-6')
        expect(text).toHaveClass('text-[10px]', 'sm:text-xs')
      })
    })

    it('has proper shadow and layout styling', () => {
      renderWithViewport(<Footer />, 'desktop')

      const footer = screen.getByRole('contentinfo')
      const container = footer.querySelector('div')

      expect(footer).toHaveClass('shadow-md')
      expect(container).toHaveClass('flex', 'justify-around', 'items-center', 'relative', 'h-16', 'sm:h-20')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('renders safely when pathname is undefined', () => {
      mockUsePathname.mockReturnValue(undefined as any)

      expect(() => {
        renderWithViewport(<Footer />, 'desktop')
      }).not.toThrow()

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('handles unknown pathname correctly', () => {
      mockUsePathname.mockReturnValue('/unknown-route')
      renderWithViewport(<Footer />, 'desktop')

      // No links should be highlighted for unknown routes
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).not.toHaveStyle({ backgroundColor: '#F1D688' })
      })
    })

    it('maintains functionality when theme colors are not loaded', () => {
      renderWithViewport(<Footer />, 'desktop')

      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()

      // Links should still be functional
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(4)
    })
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '@/app/components/Header'
import {
  renderWithViewport,
  testAllViewports,
  type ViewportSize
} from '@/utils/test-utils'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, className, style, ...props }: any) => (
    <a href={href} className={className} style={style} {...props}>
      {children}
    </a>
  ),
}))

describe('Header Component', () => {
  describe('Responsive Design Tests', () => {
    it('renders correctly on mobile viewport', () => {
      renderWithViewport(<Header />, 'mobile')

      expect(screen.getByText('Ngam.je')).toBeInTheDocument()
      expect(screen.getByText('Reuse & Recycle')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders correctly on tablet viewport', () => {
      renderWithViewport(<Header />, 'tablet')

      expect(screen.getByText('Ngam.je')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders correctly on desktop viewport', () => {
      renderWithViewport(<Header />, 'desktop')

      expect(screen.getByText('Ngam.je')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('maintains layout integrity across all viewport sizes', () => {
      testAllViewports((viewport: ViewportSize) => {
        const { container } = renderWithViewport(<Header />, viewport)

        // Check that header structure is maintained
        const header = screen.getByRole('banner')
        const logo = screen.getByText('Ngam.je')
        const tagline = screen.getByText('Reuse & Recycle')

        expect(header).toBeInTheDocument()
        expect(logo).toBeInTheDocument()
        expect(tagline).toBeInTheDocument()

        // Verify responsive layout classes
        expect(header).toHaveClass('w-full', 'flex', 'justify-between', 'items-center')

        container.remove()
      })
    })

    it('applies responsive padding and sizing correctly', () => {
      testAllViewports((viewport: ViewportSize) => {
        const { container } = renderWithViewport(<Header />, viewport)

        const header = screen.getByRole('banner')
        expect(header).toHaveClass('px-4', 'sm:px-6', 'py-3')

        container.remove()
      })
    })
  })

  describe('Component Structure Tests', () => {
    it('displays logo with puzzle icon', () => {
      renderWithViewport(<Header />, 'desktop')

      const logo = screen.getByText('Ngam.je')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveClass('font-bold')

      // Check for puzzle icon (lucide icons render as SVG)
      const logoContainer = logo.closest('div')?.previousElementSibling
      expect(logoContainer).toBeInTheDocument()
    })

    it('displays correct app name and tagline', () => {
      renderWithViewport(<Header />, 'desktop')

      expect(screen.getByText('Ngam.je')).toBeInTheDocument()
      expect(screen.getByText('Reuse & Recycle')).toBeInTheDocument()
    })

    it('renders notification and logout buttons', () => {
      renderWithViewport(<Header />, 'desktop')

      const links = screen.getAllByRole('link')
      const notificationLink = links.find(link => link.getAttribute('href') === '/notifications')
      const logoutLink = links.find(link => link.getAttribute('href') === '/logout')

      expect(notificationLink).toBeInTheDocument()
      expect(logoutLink).toBeInTheDocument()
      expect(notificationLink).toHaveAttribute('href', '/notifications')
      expect(logoutLink).toHaveAttribute('href', '/logout')
    })
  })

  describe('Notification Badge Tests', () => {
    it('displays notification badge when notifications > 0', () => {
      renderWithViewport(<Header notifications={3} />, 'desktop')

      const badge = screen.getByText('3')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('absolute', 'font-bold', 'rounded-full')
    })

    it('does not display notification badge when notifications = 0', () => {
      renderWithViewport(<Header notifications={0} />, 'desktop')

      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('displays notification badge with default value (0)', () => {
      renderWithViewport(<Header />, 'desktop')

      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('handles large notification numbers', () => {
      renderWithViewport(<Header notifications={99} />, 'desktop')

      const badge = screen.getByText('99')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('User Interaction Tests', () => {
    it('notification button is clickable', async () => {
      const user = userEvent.setup()
      renderWithViewport(<Header />, 'desktop')

      const notificationButton = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/notifications')
      await user.click(notificationButton)

      expect(notificationButton).toBeInTheDocument()
    })

    it('logout button is clickable', async () => {
      const user = userEvent.setup()
      renderWithViewport(<Header />, 'desktop')

      const logoutButton = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/logout')
      await user.click(logoutButton)

      expect(logoutButton).toBeInTheDocument()
    })

    it('buttons have proper hover states', () => {
      renderWithViewport(<Header />, 'desktop')

      const notificationButton = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/notifications')
      const logoutButton = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/logout')

      expect(notificationButton).toHaveClass('transition')
      expect(logoutButton).toHaveClass('transition')
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper semantic HTML structure', () => {
      renderWithViewport(<Header />, 'desktop')

      expect(screen.getByRole('banner')).toBeInTheDocument() // header
      expect(screen.getAllByRole('link')).toHaveLength(2) // notification and logout links
    })

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      renderWithViewport(<Header />, 'desktop')

      const notificationButton = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/notifications')
      const logoutButton = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/logout')

      // Tab to first button
      await user.tab()
      expect(notificationButton).toHaveFocus()

      // Tab to second button
      await user.tab()
      expect(logoutButton).toHaveFocus()
    })

    it('has proper link attributes', () => {
      renderWithViewport(<Header />, 'desktop')

      const notificationLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/notifications')
      const logoutLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/logout')

      expect(notificationLink).toHaveAttribute('href', '/notifications')
      expect(logoutLink).toHaveAttribute('href', '/logout')
    })
  })

  describe('Styling Tests', () => {
    it('applies correct theme colors', () => {
      renderWithViewport(<Header />, 'desktop')

      const header = screen.getByRole('banner')
      expect(header).toHaveStyle({ backgroundColor: '#E8EDDF' })
    })

    it('applies correct responsive classes', () => {
      renderWithViewport(<Header />, 'desktop')

      const header = screen.getByRole('banner')
      expect(header).toHaveClass(
        'w-full',
        'flex',
        'justify-between',
        'items-center',
        'px-4',
        'sm:px-6',
        'py-3'
      )
    })

    it('logo has correct styling', () => {
      renderWithViewport(<Header />, 'desktop')

      const appName = screen.getByText('Ngam.je')
      const tagline = screen.getByText('Reuse & Recycle')

      expect(appName).toHaveClass('font-bold')
      expect(tagline).toHaveClass('text-xs', 'sm:text-sm')
    })
  })

  describe('Edge Cases', () => {
    it('renders without crashing when no props provided', () => {
      expect(() => {
        renderWithViewport(<Header />, 'desktop')
      }).not.toThrow()
    })

    it('handles undefined notifications prop gracefully', () => {
      expect(() => {
        renderWithViewport(<Header notifications={undefined as any} />, 'desktop')
      }).not.toThrow()
    })

    it('handles negative notification numbers', () => {
      renderWithViewport(<Header notifications={-1} />, 'desktop')

      // Should not display badge for negative numbers
      expect(screen.queryByText('-1')).not.toBeInTheDocument()
    })
  })
})
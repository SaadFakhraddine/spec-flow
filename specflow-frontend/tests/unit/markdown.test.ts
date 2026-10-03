import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '@/utils/markdown'

describe('renderMarkdown', () => {
  it('renders bold text', () => {
    expect(renderMarkdown('**hi**')).toContain('<strong>hi</strong>')
  })

  it('strips script tags', () => {
    const html = renderMarkdown('<script>alert(1)</script>safe')
    expect(html).not.toContain('<script')
    expect(html).toContain('safe')
  })
})

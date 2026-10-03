import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CommentForm from '@/components/features/CommentForm.vue'

describe('CommentForm', () => {
  it('emits trimmed body on submit and ignores empty input', async () => {
    const wrapper = mount(CommentForm)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.get('#comment-body').setValue('  Ship it  ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['Ship it'])
  })
})

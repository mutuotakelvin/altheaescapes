import {defineField, defineType} from 'sanity'

export const question = defineType({
  name: 'question',
  type: 'object',
  fields: [
    defineField({name: 'question', type: 'string'}),
    defineField({name: 'answer', type: 'text'}),
  ],
})

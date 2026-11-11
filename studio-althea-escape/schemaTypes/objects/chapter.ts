import {defineArrayMember, defineField, defineType} from 'sanity'

export const chapter = defineType({
  name: 'chapter',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({
      name: 'body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
  ],
})

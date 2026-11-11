import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({
      name: 'description',
      type: 'text',
      validation: (rule) => rule.max(200).warning(),
    }),
  ],
})

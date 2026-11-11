import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Field note',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'categoryLabel', type: 'string'}),
    defineField({name: 'minutes', type: 'number'}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string'})],
    }),
    defineField({name: 'excerpt', type: 'text'}),
    defineField({
      name: 'chapters',
      type: 'array',
      of: [defineArrayMember({type: 'chapter'})],
    }),
    defineField({name: 'order', type: 'number'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'categoryLabel'},
  },
})

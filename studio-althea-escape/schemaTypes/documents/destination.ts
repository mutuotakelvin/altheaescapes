import {PinIcon} from '@sanity/icons/Pin'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const destination = defineType({
  name: 'destination',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string'})],
    }),
    defineField({
      name: 'image2',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string'})],
    }),
    defineField({name: 'headline', type: 'string'}),
    defineField({name: 'intro', type: 'text'}),
    defineField({
      name: 'paragraphs',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'moments',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({name: 'category', type: 'string'}),
    defineField({name: 'order', type: 'number'}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'eyebrow'},
  },
})

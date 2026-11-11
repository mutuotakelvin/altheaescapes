import {RocketIcon} from '@sanity/icons/Rocket'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const adventure = defineType({
  name: 'adventure',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'title',
      description: 'Hero display title, for example “TAKE THE LEAP”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      description: 'Detail page name, for example “Take the leap”.',
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
    defineField({name: 'description', type: 'text'}),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          validation: (rule) => rule.required().warning(),
        }),
      ],
    }),
    defineField({
      name: 'heroDesktopFocus',
      description: 'Optional object position for desktop, for example “50% 82%”.',
      type: 'string',
    }),
    defineField({
      name: 'heroMobileFocus',
      description: 'Optional object position for mobile, for example “55% 38%”.',
      type: 'string',
    }),
    defineField({
      name: 'cardImage',
      type: 'image',
      fields: [defineField({name: 'alt', type: 'string'})],
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: ['Air', 'Water', 'Land', 'Wilderness']},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'destination',
      type: 'reference',
      to: [{type: 'destination'}],
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'mood', type: 'string'}),
    defineField({name: 'pace', type: 'string'}),
    defineField({name: 'bestFor', type: 'string'}),
    defineField({name: 'intro', type: 'text'}),
    defineField({name: 'story', type: 'text'}),
    defineField({name: 'quote', type: 'string'}),
    defineField({
      name: 'highlights',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'bring',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'dayFlow',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string'}),
            defineField({name: 'copy', type: 'text'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'heroOrder',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'category'},
  },
})

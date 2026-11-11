import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  icon: HomeIcon,
  type: 'document',
  fields: [
    defineField({name: 'heroLabel', type: 'string'}),
    defineField({
      name: 'introduction',
      type: 'object',
      fields: [
        defineField({name: 'kicker', type: 'string'}),
        defineField({
          name: 'heading',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'paragraphs',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({name: 'linkLabel', type: 'string'}),
        defineField({name: 'footerLabel', type: 'string'}),
      ],
    }),
    defineField({
      name: 'explore',
      type: 'object',
      fields: [
        defineField({name: 'kicker', type: 'string'}),
        defineField({name: 'title', type: 'string'}),
        defineField({
          name: 'copy',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
      ],
    }),
    defineField({
      name: 'featured',
      type: 'object',
      fields: [
        defineField({name: 'kicker', type: 'string'}),
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'description', type: 'text'}),
        defineField({name: 'note', type: 'string'}),
        defineField({name: 'linkLabel', type: 'string'}),
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'escape',
                  title: 'Adventure',
                  type: 'reference',
                  to: [{type: 'adventure'}],
                }),
                defineField({name: 'name', type: 'string'}),
                defineField({name: 'detail', type: 'string'}),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'story',
      type: 'object',
      fields: [
        defineField({
          name: 'image',
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string'})],
        }),
        defineField({name: 'note', type: 'string'}),
        defineField({name: 'kicker', type: 'string'}),
        defineField({
          name: 'heading',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'paragraphs',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({name: 'linkLabel', type: 'string'}),
      ],
    }),
    defineField({
      name: 'destinations',
      type: 'object',
      fields: [
        defineField({name: 'kicker', type: 'string'}),
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'description', type: 'text'}),
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'destination',
                  type: 'reference',
                  to: [{type: 'destination'}],
                }),
                defineField({name: 'eyebrow', type: 'string'}),
                defineField({name: 'title', type: 'string'}),
                defineField({name: 'detail', type: 'string'}),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'planning',
      type: 'object',
      fields: [
        defineField({name: 'kicker', type: 'string'}),
        defineField({
          name: 'heading',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({name: 'linkLabel', type: 'string'}),
        defineField({
          name: 'steps',
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
      ],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'object',
      fields: [
        defineField({name: 'kicker', type: 'string'}),
        defineField({
          name: 'heading',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({name: 'copy', type: 'string'}),
        defineField({
          name: 'questions',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})],
        }),
      ],
    }),
    defineField({
      name: 'closing',
      type: 'object',
      fields: [
        defineField({
          name: 'image',
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string'})],
        }),
        defineField({name: 'kicker', type: 'string'}),
        defineField({
          name: 'heading',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({name: 'copy', type: 'string'}),
        defineField({name: 'ctaLabel', title: 'Call-to-action label', type: 'string'}),
      ],
    }),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {
    prepare: () => ({title: 'Home page'}),
  },
})

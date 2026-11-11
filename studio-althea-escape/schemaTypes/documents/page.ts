import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const page = defineType({
  name: 'page',
  type: 'document',
  icon: DocumentIcon,
  fieldsets: [
    {name: 'intro', title: 'Introduction'},
    {name: 'seo', title: 'SEO'},
    {name: 'about', title: 'About page'},
    {name: 'contact', title: 'Contact page'},
    {name: 'plan', title: 'Plan page'},
    {name: 'cta', title: 'Closing call to action'},
    {name: 'privacyTerms', title: 'Privacy and terms'},
    {name: 'listings', title: 'Listing pages'},
  ],
  fields: [
    defineField({
      name: 'intro',
      type: 'object',
      fieldset: 'intro',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'description', type: 'text'}),
      ],
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      fieldset: 'seo',
    }),
    defineField({
      name: 'ctaTitle',
      title: 'Call-to-action title',
      type: 'string',
      fieldset: 'cta',
    }),
    defineField({
      name: 'panorama',
      type: 'object',
      fieldset: 'about',
      fields: [
        defineField({
          name: 'image',
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string'})],
        }),
        defineField({name: 'note', type: 'string'}),
      ],
    }),
    defineField({
      name: 'story',
      type: 'object',
      fieldset: 'about',
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
      ],
    }),
    defineField({
      name: 'values',
      type: 'array',
      fieldset: 'about',
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
      name: 'closing',
      type: 'object',
      fieldset: 'about',
      fields: [
        defineField({name: 'kicker', type: 'string'}),
        defineField({
          name: 'heading',
          description: 'The last line is rendered as an accent span.',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({name: 'copy', type: 'text'}),
      ],
    }),
    defineField({
      name: 'feature',
      type: 'object',
      fieldset: 'contact',
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
        defineField({name: 'cta', title: 'Call to action', type: 'navLink'}),
      ],
    }),
    defineField({
      name: 'options',
      type: 'array',
      fieldset: 'contact',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string'}),
            defineField({name: 'heading', type: 'string'}),
            defineField({name: 'copy', type: 'text'}),
            defineField({name: 'link', type: 'navLink'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'faqHeading',
      title: 'FAQ heading',
      type: 'string',
      fieldset: 'contact',
    }),
    defineField({
      name: 'planner',
      type: 'object',
      fieldset: 'plan',
      fields: [
        defineField({
          name: 'steps',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'headings',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'kickers',
          description: 'One kicker per planner step, in order.',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'crewOptions',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'timingOptions',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'paceOptions',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'aside',
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string'}),
            defineField({name: 'heading', type: 'string'}),
            defineField({name: 'intro', type: 'text'}),
            defineField({
              name: 'items',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
            }),
            defineField({name: 'note', type: 'text'}),
            defineField({name: 'link', type: 'navLink'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'sections',
      type: 'array',
      fieldset: 'privacyTerms',
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
      name: 'introCounter',
      type: 'object',
      fieldset: 'listings',
      fields: [
        defineField({name: 'number', type: 'string'}),
        defineField({name: 'label', type: 'string'}),
      ],
    }),
    defineField({
      name: 'note',
      type: 'string',
      fieldset: 'listings',
    }),
  ],
  preview: {
    select: {title: 'intro.title', subtitle: 'intro.eyebrow'},
  },
})

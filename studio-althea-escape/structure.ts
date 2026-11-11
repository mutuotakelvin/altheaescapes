import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Adventures')
        .schemaType('adventure')
        .child(S.documentTypeList('adventure').title('Adventures')),
      S.listItem()
        .title('Destinations')
        .schemaType('destination')
        .child(S.documentTypeList('destination').title('Destinations')),
      S.listItem()
        .title('Field notes')
        .schemaType('article')
        .child(S.documentTypeList('article').title('Field notes')),
      S.listItem()
        .title('FAQs')
        .schemaType('faq')
        .child(S.documentTypeList('faq').title('FAQs')),
      S.divider(),
      S.listItem()
        .title('Site')
        .child(
          S.list()
            .title('Site')
            .items([
              S.listItem()
                .title('Home page')
                .child(S.document().schemaType('homePage').documentId('homePage')),
              S.listItem()
                .title('About')
                .child(S.document().schemaType('page').documentId('aboutPage')),
              S.listItem()
                .title('Contact')
                .child(S.document().schemaType('page').documentId('contactPage')),
              S.listItem()
                .title('Plan your escape')
                .child(S.document().schemaType('page').documentId('planPage')),
              S.listItem()
                .title('FAQs page')
                .child(S.document().schemaType('page').documentId('faqsPage')),
              S.listItem()
                .title('Adventures page')
                .child(S.document().schemaType('page').documentId('adventuresPage')),
              S.listItem()
                .title('Destinations page')
                .child(S.document().schemaType('page').documentId('destinationsPage')),
              S.listItem()
                .title('Journal page')
                .child(S.document().schemaType('page').documentId('journalPage')),
              S.listItem()
                .title('Privacy')
                .child(S.document().schemaType('page').documentId('privacyPage')),
              S.listItem()
                .title('Terms')
                .child(S.document().schemaType('page').documentId('termsPage')),
              S.listItem()
                .title('Site settings')
                .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            ]),
        ),
    ])

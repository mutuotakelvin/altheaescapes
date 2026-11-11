import {chapter} from './objects/chapter'
import {navLink} from './objects/link'
import {question} from './objects/question'
import {seo} from './objects/seo'
import {adventure} from './documents/adventure'
import {article} from './documents/article'
import {destination} from './documents/destination'
import {faq} from './documents/faq'
import {homePage} from './documents/homePage'
import {page} from './documents/page'
import {siteSettings} from './documents/siteSettings'

export const schemaTypes = [
  chapter,
  seo,
  navLink,
  question,
  adventure,
  destination,
  article,
  faq,
  page,
  homePage,
  siteSettings,
]

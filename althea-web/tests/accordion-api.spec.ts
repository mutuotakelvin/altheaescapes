import { test, expect } from '@playwright/test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import AccordionGallery from '../components/adventure/AccordionGallery';

test('the supplied API accepts remote images without Next host configuration', () => {
  const html = renderToString(createElement(AccordionGallery, {
    items: [{ image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' }],
    defaultIndex: 0,
  }));
  expect(html).toContain('https://picsum.photos/id/1015/900/1200');
  expect(html).toContain('Expand Canyon');
});

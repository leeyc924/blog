import { describe, it, expect, beforeEach } from 'vitest';
import { filterPosts, initSearch } from '../../src/scripts/search';

function createCard(data: {
  title?: string;
  description?: string;
  tags?: string;
}): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-post-card', '');
  if (data.title !== undefined) el.dataset.title = data.title;
  if (data.description !== undefined) el.dataset.description = data.description;
  if (data.tags !== undefined) el.dataset.tags = data.tags;
  return el;
}

describe('search', () => {
  describe('filterPosts', () => {
    it('shows all cards with empty query', () => {
      const cards = [
        createCard({ title: 'Hello', description: 'World', tags: 'js' }),
        createCard({ title: 'Foo', description: 'Bar', tags: 'ts' }),
      ];
      const count = filterPosts('', cards);
      expect(count).toBe(2);
      expect(cards[0].style.display).toBe('');
      expect(cards[1].style.display).toBe('');
    });

    it('matches by title (case insensitive)', () => {
      const cards = [
        createCard({ title: 'JavaScript Guide', description: '', tags: '' }),
        createCard({ title: 'Python Guide', description: '', tags: '' }),
      ];
      const count = filterPosts('javascript', cards);
      expect(count).toBe(1);
      expect(cards[0].style.display).toBe('');
      expect(cards[1].style.display).toBe('none');
    });

    it('matches by description', () => {
      const cards = [
        createCard({ title: '', description: 'Learn React', tags: '' }),
        createCard({ title: '', description: 'Learn Vue', tags: '' }),
      ];
      const count = filterPosts('react', cards);
      expect(count).toBe(1);
      expect(cards[0].style.display).toBe('');
      expect(cards[1].style.display).toBe('none');
    });

    it('matches by tags', () => {
      const cards = [
        createCard({ title: '', description: '', tags: 'typescript,react' }),
        createCard({ title: '', description: '', tags: 'python' }),
      ];
      const count = filterPosts('typescript', cards);
      expect(count).toBe(1);
      expect(cards[0].style.display).toBe('');
      expect(cards[1].style.display).toBe('none');
    });

    it('hides non-matching cards', () => {
      const cards = [
        createCard({ title: 'Foo', description: 'Bar', tags: 'baz' }),
      ];
      const count = filterPosts('nonexistent', cards);
      expect(count).toBe(0);
      expect(cards[0].style.display).toBe('none');
    });

    it('returns count of visible cards', () => {
      const cards = [
        createCard({ title: 'Alpha', description: '', tags: '' }),
        createCard({ title: 'Beta', description: '', tags: '' }),
        createCard({ title: 'Alpha Two', description: '', tags: '' }),
      ];
      const count = filterPosts('alpha', cards);
      expect(count).toBe(2);
    });

    it('handles cards with missing data attributes', () => {
      const cards = [createCard({})];
      const count = filterPosts('anything', cards);
      expect(count).toBe(0);
      expect(cards[0].style.display).toBe('none');
    });
  });

  describe('initSearch', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('does nothing when search input not found', () => {
      initSearch();
      // No error thrown
    });

    it('does nothing when no post cards exist', () => {
      const input = document.createElement('input');
      input.id = 'search-input';
      document.body.appendChild(input);

      initSearch();
      // No error thrown, listener not attached meaningfully
    });

    it('attaches input event listener', () => {
      const input = document.createElement('input');
      input.id = 'search-input';
      document.body.appendChild(input);

      const card = createCard({ title: 'Test Post', description: '', tags: '' });
      document.body.appendChild(card);

      initSearch();

      input.value = 'nonexistent';
      input.dispatchEvent(new Event('input'));

      expect(card.style.display).toBe('none');
    });
  });
});

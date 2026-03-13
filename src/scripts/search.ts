export function filterPosts(
  query: string,
  cards: NodeListOf<HTMLElement> | HTMLElement[],
): number {
  const normalizedQuery = query.toLowerCase().trim();
  let visibleCount = 0;

  cards.forEach((card) => {
    const title = (card.dataset.title ?? '').toLowerCase();
    const description = (card.dataset.description ?? '').toLowerCase();
    const tags = (card.dataset.tags ?? '').toLowerCase();

    const matches =
      normalizedQuery === '' ||
      title.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      tags.includes(normalizedQuery);

    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  return visibleCount;
}

export function initSearch(): void {
  const input = document.getElementById(
    'search-input',
  ) as HTMLInputElement | null;
  if (!input) return;

  const postCards = document.querySelectorAll<HTMLElement>('[data-post-card]');
  if (postCards.length === 0) return;

  input.addEventListener('input', () => {
    filterPosts(input.value, postCards);
  });
}

export type Card = string;

export function cardFields(card: Card) {
  const suite = card.slice(1, 2);
  return {
    suite,
    rank: card[3],
    isRed: suite === '♦️' || suite === '♥️',
    deck: card[0],
  }
}

export const suitemoji = ['♣︎', '♦️', '♠️', '♥️'];
export const rankmoji = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'J',
  'Q',
  'K',
];

export function compareRanks(rankA: string, rankB: string) {
  return Math.max(-1, Math.min(1, rankmoji.indexOf(rankA) - rankmoji.indexOf(rankB)));
}

export type Pile = String;

export function isEmptyPile(pile: Pile) {
  return pile.length === 0;
}

export function topCard(pile:Pile) {
  if (isEmptyPile(pile)) throw 'Empty pile';
  return pile.slice(0,4);
}

export function bottomCard(pile: Pile) {
  if (isEmptyPile(pile)) throw 'Empty pile';
  return pile.slice(-4);
}

export function pileWithoutDeck(pile: Pile) {
  return pile.split('-').map(card => card.slice(-3)).join('-');
}

export const newShuffledDeck = (deckIndex: number) => {
  const deck: Card[] = [];
  suitemoji.forEach(suite => {
    rankmoji.forEach(rank => {
      const card: Card = deckIndex + suite + rank;
      deck.push(card);
    });
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.join('-');
};

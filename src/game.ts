// A card has a rank, a suite (which includes color info), and a deck.
// We could use an object, but for a little efficiency we bit pack these into 9 bits - 4 bits for rank (1-13), 2 for suite, and 3 for deck.
// It could be a lovely as-god-intended byte if we limit to 4 players, but there's not really a need for that, except aesthetic & religious purity.
// We could just number cards 0-51 but then we have to use division (instead of bit operations) to get suites and color, and I cannot abide that
// We could use 0-12 for rank, but it costs us nothing to have a little readability

export type Card = number;

export const cardRank = (card: Card) => card & 0b000001111;
export const cardSuite = (card: Card) => ((card & 0b000110000) >> 4) as Suite;
export const cardColor = (card: Card) => ((card & 0b000010000) >> 4) as Color;
export const cardDeck = (card: Card) => (card & 0b111000000) >> 6;

export enum Suite {
  Clubs,
  Diamonds,
  Spades,
  Hearts,
}

export enum Color {
  Black,
  Red,
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
  '10',
  'J',
  'Q',
  'K',
];

export function newCard(name: string, deck?: number): Card;
export function newCard(rank: number, suite: number, deck?: number): Card;
export function newCard(...args: [number | string, number?, number?]): Card {
  return typeof args[0] === 'number'
    ? args[0] | (args[1]! << 4) | ((args[2] ?? 0) << 6)
    : (rankmoji.indexOf(args[0].slice(2)) + 1) |
        (suitemoji.indexOf(args[0].slice(0, 2)) << 4) |
        ((args[1] ?? 0) << 6);
}

export function cardName(card: Card): string {
  return `${suitemoji[cardSuite(card)]}${rankmoji[cardRank(card) - 1]}`;
}

export type Pile = Card[];

export function topCard(pile: Pile) {
  const len = pile.length;
  if (len === 0) throw 'Empty pile';
  return pile[len - 1];
}

export function newPile(cards: string[]): Pile;
export function newPile(cards: string): Pile;
export function newPile(cards: string | string[]): Pile {
  return (typeof cards === 'string' ? cards.split('-') : cards).map(card =>
    newCard(card)
  );
}

export function pileToString(pile: Pile) {
  return pile.map(cardName).join('-');
}

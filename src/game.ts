export enum Suit {
  Clubs,
  Diamonds,
  Spades,
  Hearts,
}

export const suitmoji = ['♣︎', '♦️', '♠️', '♥️'];
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

export interface Card {
  suit: number;
  rank: number;
  playerId: string;
}

export function cardToString(
  {suit, rank, playerId}: Card,
  showPlayer = true
) {
  return (
    (showPlayer ? playerId + '-' : '') + suitmoji[suit] + '-' + rankmoji[rank]
  );
}

type Pile = Card[];

export function pileToString(pile: Card[], showPlayer = true) {
  return pile.map(card => cardToString(card, showPlayer)).join(' ');
}

export function isRed({suit}: Card) {
  return suit === Suit.Diamonds || suit === Suit.Hearts;
}

export function isEmptyPile(pile: Pile) {
  return pile.length === 0;
}

export function topCard(pile: Pile) {
  if (isEmptyPile(pile)) throw 'Empty pile';
  return pile[pile.length - 1];
}

export function bottomCard(pile: Pile) {
  if (isEmptyPile(pile)) throw 'Empty pile';
  return pile[0];
}

export const newShuffledDeck = (playerId: string) => {
  const deck: Card[] = [];
  for (let suit = Suit.Clubs; suit <= Suit.Spades; suit++) {
    for (let rank = 0; rank < 13; rank++) {
      deck.push({playerId, rank, suit});
    }
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

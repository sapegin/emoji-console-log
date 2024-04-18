export const emojis = [
  '🌮',
  '🦆',
  '🦜',
  '🍕',
  '🌭',
  '🍔',
  '🥑',
  '🍏',
  '🦄',
  '🐴',
  '🐷',
  '🦀',
  '🍄',
  '🌈',
  '👻',
  '🤖',
  '😺',
  '🌝',
  '🔥',
  '🚀',
];

/**
 * Return non-repeating random item from an array factory
 * Source: https://stackoverflow.com/a/17891411/1973105
 */
function randomNoRepeats(array: string[]) {
  let copy = [...array];
  return () => {
    if (copy.length < 1) {
      copy = [...array];
    }
    const index = Math.floor(Math.random() * copy.length);
    const item = copy[index];
    copy.splice(index, 1);
    return item;
  };
}

export const getRandomEmoji = randomNoRepeats(emojis);

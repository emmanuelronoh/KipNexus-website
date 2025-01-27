export default function truncateText(text, maxCharacters) {
  if (text.length > maxCharacters) {
    return text.slice(0, maxCharacters) + '...';
  } else {
    return text;
  }
}

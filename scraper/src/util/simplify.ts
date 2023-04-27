const simplify = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/<[^>]*>?/gm, '');
export default simplify;

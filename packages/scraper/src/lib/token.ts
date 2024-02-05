import GPT3Tokenizer from 'gpt3-tokenizer';

const tokenizer = new GPT3Tokenizer({
  type: 'gpt3',
});

// const str = 'hello 👋 world 🌍';

// const encoded = tokenizer.encode(str);
// console.log(encoded);

// const decoded = tokenizer.decode(encoded.bpe);

// console.log(decoded);

export const TokenLength = (str: string) => {
  const encoded = tokenizer.encode(str);
  return encoded.bpe.length;
};

export const GetCost = (str: string, costPer1000Tokens = 0.002) => {
  const encoded = tokenizer.encode(str);
  const tokenLength = encoded.bpe.length;
  const cost = tokenLength * (costPer1000Tokens / 1000);
  return cost;
};

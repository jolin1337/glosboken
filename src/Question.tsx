import {
  Heading,
  Button,
  VStack,
  Text,
} from '@chakra-ui/react';

import { Glosa } from './types';

export interface IQuestion {
  wordPair: Glosa
  options: Array<Glosa>
  onAnswer: (answer: Glosa, answerIndex: number) => void
}

export default function Question({wordPair, options, onAnswer}: IQuestion) {
  const wi1 = Math.random() > 0.5 ? 0 : 1;
  const wi2 = 1 - wi1;
  return <>
    <Heading size="md">What does the word mean: {wordPair.words[wi1]}?</Heading>
    {options.map((o, i) => (<VStack key={i} spacing={8} align="stretch">
        <p/>
        <Button onClick={() => onAnswer(o, wi2)}>
          <Text>{o.words[wi2]}</Text>
        </Button>
      </VStack>
    ))}
  </>;
}



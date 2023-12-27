import {
  VStack,
  Text,

  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { Glosa } from './types';

export interface IAnswer {
  glosa: Glosa
  answer: Glosa
  answerIndex: number
}
export interface IStats {
  answers: Array<IAnswer>
  vocab?: Array<Glosa>
}

function getUnique<T>(list: Array<T>, keyFn: (p: T) => string): Array<Array<T>> {
  return Object.values(list.reduce((p: {[key: string]: T[]}, c: T) => {
    const key = keyFn(c); // `${c.glosa.words[0]}_${c.glosa.words[1]}`;
    return {...p, [key]: [c, ...(p[key] || [])]}
  }, {}))
}

export default function Stats({answers}: IStats) {
  const isCorrect = ({answer, glosa}: IAnswer) => answer.words[1] === glosa.words[1] && answer.words[0] === glosa.words[0];
  const corrects = answers.filter(isCorrect);
  const unique: Array<Array<IAnswer>> = (
    getUnique<IAnswer>(answers, c => `${c.glosa.words[0]}_${c.glosa.words[1]}`)
    .map(answers => {
      const unique = getUnique<IAnswer>(answers, c => `${c.answer.words[0]}_${c.answer.words[1]}`).sort((a, b) => {
        return b.length - a.length;
      });
      return unique.reduce((p, c) => [...p, ...c], []);
    })
  );
  const worstWords = [...unique].sort((a, b) => b.length - a.length);
  console.log(worstWords);
  return <VStack>
    <Text>Overall performance {corrects.length} / {answers.length}</Text>
    <Text>Latest quiz {unique.filter(c => isCorrect(c[0])).length} / {unique.length}</Text>
    <TableContainer overflowY="auto">
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Word to translate</Th>
            <Th>Correct transaltion</Th>
            <Th>Your most frequent answer</Th>
            <Th>Nr of answers</Th>
            <Th>Accuracy</Th>
          </Tr>
        </Thead>
        <Tbody>
          {worstWords.map((answers, i) => <Tr key={i}>
            <Td>{answers[0].glosa.words[0]}</Td>
            <Td>{answers[0].glosa.words[1]}</Td>
            <Td>{answers[0].answer.words[0]} / {answers[0].answer.words[1]}</Td>
            <Td>{answers.length}</Td>
            <Td>{(answers.filter(isCorrect).length / answers.length).toFixed(2)}</Td>
          </Tr>)}
        </Tbody>
      </Table>
    </TableContainer>
  </VStack>;
}


import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import {Input} from '@chakra-ui/react'
import {
  ChakraProvider,
  ChakraBaseProvider,
  extendBaseTheme,
  extendTheme,
  VStack,
  Box,
  Grid,
} from "@chakra-ui/react"
import {
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react"
import {
  Heading,
  Text,
  Button,
  Icon,
  IconButton,
} from "@chakra-ui/react"

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import {theme as chakraTheme} from '@chakra-ui/theme'
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { FiSettings, FiPlus, FiEdit, FiTrash } from "react-icons/fi";

const fullTheme = false;
const myTheme = fullTheme ? extendBaseTheme({
  Button: chakraTheme.components.Button
}) : extendTheme({});
const MyChakraProvider = fullTheme ? ChakraProvider : ChakraBaseProvider;


type Glosa = [string, string];

interface IQuestion {
  wordPair: Glosa
  options: Array<Glosa>
  onAnswer: (answer: Glosa) => void
}

function Question({wordPair, options, onAnswer}: IQuestion) {
  return <>
    <Heading size="md">Vad betyder ordet: {wordPair[0]}?</Heading>
    {options.map((o, i) => (<VStack key={i} spacing={8} align="stretch">
        <p/>
        <Button onClick={() => onAnswer(o)}>
          <Text>{o[1]}</Text>
        </Button>
      </VStack>
    ))}
  </>;
}

interface IStats {
  answers: Array<Glosa>
  vocab: Array<Glosa>
}
function Stats({answers, vocab}: IStats) {
  const corrects = answers.filter((a, i) => a[1] === vocab[i][1]);
  return <>
    Stats {corrects.length} / {answers.length}
  </>
}

function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const staticVocab = JSON.parse(window.localStorage.getItem('vocab') || '');
  const [vocab, setVocab] = useState(staticVocab);
  const [editRow, setEditRow] = useState<number | undefined>();
  const [word1, setWord1] = useState<string>('');
  const [word2, setWord2] = useState<string>('');
  const [newWord1, setNewWord1] = useState<string>('');
  const [newWord2, setNewWord2] = useState<string>('');

  const updateVocab = () => {
    setTimeout(() => {
      const staticVocab = JSON.parse(window.localStorage.getItem('vocab') || '');
      setEditRow(-1);
      setWord1('');
      setWord2('');
      setNewWord1('');
      setNewWord2('');
      setVocab(staticVocab);
    }, 500);
  }
  useEffect(() => {
    window.addEventListener('hashchange', updateVocab);
    return () => {
      window.removeEventListener('hashchange', updateVocab);
    };
  }, []);

  return <>
     <IconButton
      size="md"
      fontSize="lg"
      variant="ghost"
      color="current"
      marginLeft="2"
      onClick={onOpen}
      icon={<Icon as={FiSettings} />}
      aria-label={`Settings`}
    />

    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vocabulary</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Word to translate</Th>
                  <Th>Correct transaltion</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {vocab.map((g: Glosa, i: number) => (
                  <Tr key={i}>
                    {i !== editRow && <Td><Text>{g[0]}</Text></Td>}
                    {i !== editRow && <Td><Text>{g[1]}</Text></Td>}
                    {i === editRow && <Td><Input value={word1} onChange={(e: ChangeEvent<HTMLInputElement>) => setWord1(e.target?.value)} variant='filled' /></Td>}
                    {i === editRow && <Td><Input value={word2} onChange={(e: ChangeEvent<HTMLInputElement>) => setWord2(e.target?.value)} variant='filled' /></Td>}
                    <Td>
                      {editRow === i && <IconButton
                        size="md"
                        fontSize="lg"
                        variant="ghost"
                        color="current"
                        marginLeft="2"
                        onClick={() => {window.location.hash = i.toString();}}
                        icon={<Icon as={FiTrash} />}
                        aria-label={`Settings`}
                      />}
                      <IconButton
                        size="md"
                        fontSize="lg"
                        variant="ghost"
                        color="current"
                        marginLeft="2"
                        onClick={() => {
                          if (i === editRow) {
                            setEditRow(-1);
                            window.location.hash = `${word1}=${word2}=${i}`;
                          } else {
                            setEditRow(i);
                            setWord1(g[0]);
                            setWord2(g[1]);
                          }
                        }}
                        icon={<Icon as={FiEdit} />}
                        aria-label={`Settings`}
                      />
                    </Td>
                  </Tr>
                ))} 
                <Tr>
                  <Td><Input value={newWord1} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord1(e.target.value)} variant='filled' /></Td>
                  <Td><Input value={newWord2} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWord2(e.target.value)} variant='filled' /></Td>
                  <Td>
                    <IconButton
                      size="md"
                      fontSize="lg"
                      variant="ghost"
                      color="current"
                      marginLeft="2"
                      onClick={() => {window.location.hash = `${newWord1}=${newWord2}`;}}
                      icon={<Icon as={FiPlus} />}
                      aria-label={`Settings`}
                    />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>;
}

function App() {
  let defaultVocab: Array<Glosa> = [
    ['Jag', 'Ben'],
    ['Du', 'Sen'],
    ['Han/Hon', 'O'],
    ['Vi', 'Biz'],
    ['Dem', 'Siz'],
    ['Dricka', 'Icer'],
    ['Äta', 'yer'],
    ['Vatten', 'Su'],
    ['Mjölk', 'Sut'],
  ];
  if (window.localStorage.getItem('vocab')?.trim()) {
    defaultVocab = JSON.parse(window.localStorage.getItem('vocab') || '');
  } else {
    window.localStorage.setItem('vocab', JSON.stringify(defaultVocab));
  }
  const [vocab, setVocab] = useState(defaultVocab);
  const [options, setOptions] = useState<undefined | Array<Glosa>>();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Array<Glosa>>([]);

  useEffect(() => {
    window.addEventListener('hashchange', addDelWord);
    return () => {
      window.removeEventListener('hashchange', addDelWord);
    };
  }, []);

  useEffect(() => {
    currentIndex < vocab.length && setOptions(getRandomOptions(currentIndex));
  }, [currentIndex])

  const addDelWord = () => {
    const word = window.location.hash.slice(1).split('=', 3);
    const vocab = JSON.parse(window.localStorage.getItem('vocab') || '');
    if (
      word.length == 3 && 
      word[0].trim().length > 0 && 
      word[1].trim().length > 0 && 
      !isNaN(Number(word[2]))
    ) {
      const newWord: Glosa = [word[0].trim(), word[1].trim()];
      const n = parseInt(word[2]);
      if (n >= 0 && n < vocab.length) {
        const newVocab = [...vocab];
        newVocab.splice(n, 1, newWord);
        setVocab(newVocab);
        window.localStorage.setItem('vocab', JSON.stringify(newVocab));
      }
    } else if (
      word.length == 2 && 
      word[0].trim().length > 0 && 
      word[1].trim().length > 0
    ) {
      const newWord: Glosa = [word[0].trim(), word[1].trim()];
      const exits = vocab.find((w: Glosa) => w[0] === newWord[0] && w[1] === newWord[1].trim());
      if (!exits) {
        setVocab([...vocab, newWord]);
        window.localStorage.setItem('vocab', JSON.stringify([...vocab, newWord]));
      }
    } else if (word.length === 1 && !isNaN(Number(word[0]))) {
      const n = parseInt(word[0]);
      if (n >= 0 && n < vocab.length) {
        const newVocab = vocab.slice(0, n).concat(vocab.slice(n + 1));
        setVocab(newVocab);
        window.localStorage.setItem('vocab', JSON.stringify(newVocab));
      }
    }
  }

  const getRandomOptions = (i: number) => {
    const options = vocab.filter(f => f[0] !== vocab[i][0]).sort(() => Math.random() - 0.5).slice(4);
    const split = Math.floor(Math.random() * (1 + options.length));
    return options.slice(0, split).concat([vocab[i]]).concat(options.slice(split));
  };
  const onAnswer = (answer: Glosa) => {
    setAnswers([...answers, answer]);
    setCurrentIndex(currentIndex + 1);
  };

  return <MyChakraProvider theme={myTheme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <Box justifySelf="flex-end">
          <Settings />
          <ColorModeSwitcher />
        </Box>
        <Card align="center">
        <CardHeader align="center">
          <Heading size="xl">Quiz</Heading>
          <Text>{currentIndex < vocab.length && <>Svara på frågan nedan (fråga {currentIndex + 1} av {vocab.length})</>}</Text>
        </CardHeader>
          <CardBody>
            {options && currentIndex < vocab.length && <Question wordPair={vocab[currentIndex]} options={options} onAnswer={onAnswer} />}
            {currentIndex >= vocab.length && <Stats answers={answers} vocab={vocab}/>}
          </CardBody>
        </Card>
      </Grid>
    </Box>
  </MyChakraProvider>;
}

export default App

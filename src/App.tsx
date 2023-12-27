import { useState, useEffect, useCallback } from 'react'
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
} from "@chakra-ui/react"
import {
  Select,
} from "chakra-react-select";


import {theme as chakraTheme} from '@chakra-ui/theme'
import { ColorModeSwitcher } from "./ColorModeSwitcher"

import { Glosa } from './types'
import Settings from './Settings'
import Stats, {IAnswer} from './Stats';
import Question from './Question';

const fullTheme = false;
const myTheme = fullTheme ? extendBaseTheme({
  Button: chakraTheme.components.Button
}) : extendTheme({});
const MyChakraProvider = fullTheme ? ChakraProvider : ChakraBaseProvider;

function App() {
  let defaultVocab: Array<Glosa> = [
    {words: ['Jag', 'Ben'], tags: []},
    {words: ['Du', 'Sen'], tags: []},
    {words: ['Han/Hon', 'O'], tags: []},
    {words: ['Vi', 'Biz'], tags: []},
    {words: ['Dem', 'Siz'], tags: []},
    {words: ['Dricka', 'Icer'], tags: []},
    {words: ['Äta', 'yer'], tags: []},
    {words: ['Vatten', 'Su'], tags: []},
    {words: ['Mjölk', 'Sut'], tags: []},
  ];
  if (window.localStorage.getItem('vocab')?.trim()) {
    defaultVocab = JSON.parse(window.localStorage.getItem('vocab') || '');
  } else {
    window.localStorage.setItem('vocab', JSON.stringify(defaultVocab));
  }
  const [vocab, setVocab] = useState(defaultVocab);
  const [options, setOptions] = useState<undefined | Array<Glosa>>();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [filterTags, setFilterTags] = useState<Array<{label: string, value: string}>>([]);
  const [answers, setAnswers] = useState<Array<IAnswer>>([]);
  const availableTags = Object.keys(vocab.reduce((p, g) => {
    return {
      ...g.tags.reduce((p1, g1) => ({...p1, [g1]: 1}), {}),
      ...p
    }
  }, {})).map(t => ({value: t, label: t}))
  const glosaInFilterTags = useCallback((glosa: Glosa) => filterTags.length === 0 || glosa.tags.find(t => filterTags.find(ft => ft.value === t)), [filterTags]);
  const nextWord = useCallback((i: number) => {
    let newIndex = i + 1;
    if (filterTags.length === 0) {
      setCurrentIndex(newIndex);
      return newIndex;
    }
    while(newIndex < vocab.length && !glosaInFilterTags(vocab[newIndex])) newIndex++;
    setCurrentIndex(newIndex);
    return newIndex;
  }, [vocab, filterTags, glosaInFilterTags]);

  const addDelWord = () => {
    const {action, index, value}: {action: string, index?: number, value?: Glosa} = JSON.parse(decodeURI(window.location.hash.slice(1)));
    const vocab = JSON.parse(window.localStorage.getItem('vocab') || '');
    
    if (
      action === 'replace' && 
      value && (
        value.words[0].trim().length > 0 && 
        value.words[1].trim().length > 0
      ) && 
      index !== undefined && index >= 0 && index < vocab.length
    ) {
      const newWord: Glosa = {words: [value.words[0].trim(), value.words[1].trim()], tags: value.tags};
      const newVocab = [...vocab];
      newVocab.splice(index, 1, newWord);
      setVocab(newVocab);
      console.log("Setting new vocab");
      window.localStorage.setItem('vocab', JSON.stringify(newVocab));
    } else if (
      action === 'create' && 
      value && (
        value.words[0].trim().length > 0 && 
        value.words[1].trim().length > 0
      )
    ) {
      const newWord: Glosa = {words: [value.words[0].trim(), value.words[1].trim()], tags: value.tags};
      const exits = vocab.find((w: Glosa) => w.words[0] === newWord.words[0] && w.words[1] === newWord.words[1].trim());
      if (!exits) {
        setVocab([...vocab, newWord]);
        console.log("Setting new vocab");
        window.localStorage.setItem('vocab', JSON.stringify([...vocab, newWord]));
      } else {
        console.warn("New word already exists, skipping")
      }
    } else if (action === 'delete' && index !== undefined && index >= 0 && index < vocab.length) {
      const newVocab = vocab.slice(0, index).concat(vocab.slice(index + 1));
      setVocab(newVocab);
      console.log("Setting new vocab");
      window.localStorage.setItem('vocab', JSON.stringify(newVocab));
    }
  }

  const getRandomOptions = useCallback((i: number) => {
    const options = vocab.filter(f => f.words[0] !== vocab[i].words[0]).sort(() => Math.random() - 0.5).slice(4);
    const split = Math.floor(Math.random() * (1 + options.length));
    return options.slice(0, split).concat([vocab[i]]).concat(options.slice(split));
  }, [vocab]);
  
  const onAnswer = (answer: Glosa, answerIndex: number) => {
    setAnswers([...answers, {answer, answerIndex, glosa: vocab[currentIndex]}]);
    const nextIndex = nextWord(currentIndex);
    if (nextIndex >= vocab.length) {
      console.log(answers);
    }
  };



  useEffect(() => {
    window.addEventListener('hashchange', addDelWord);
    return () => {
      window.removeEventListener('hashchange', addDelWord);
    };
  }, []);

  useEffect(() => {
    currentIndex < vocab.length && setOptions(getRandomOptions(currentIndex));
  }, [currentIndex, vocab, getRandomOptions])
  useEffect(() => {
    nextWord(-1);
  }, [nextWord, filterTags]);

  return <MyChakraProvider theme={myTheme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <Box justifySelf="flex-end">
          <Settings />
          <ColorModeSwitcher />
        </Box>
        <Card align="center">
        <CardHeader>
          <Heading size="xl">Quiz</Heading>
          <Select
            placeholder="Choose wordgroups"
            size="md"
            isMulti 
            value={filterTags}
            onChange={(v) => setFilterTags([...v])}
            options={[...availableTags]}
          />
          <Text>{currentIndex < vocab.length && <>Answer the question below (question {currentIndex + 1 - (vocab.length - vocab.filter((v, i) => glosaInFilterTags(v) || i > currentIndex).length)} out of {vocab.filter(glosaInFilterTags).length})</>}</Text>
        </CardHeader>
          <CardBody>
            {options && currentIndex < vocab.length && <Question wordPair={vocab[currentIndex]} options={options} onAnswer={onAnswer} />}
            {currentIndex >= vocab.length && (<VStack>
              <Stats answers={answers} vocab={vocab}/>
              <Button onClick={() => nextWord(-1)}>Restart quiz</Button>
            </VStack>)}
          </CardBody>
        </Card>
      </Grid>
    </Box>
  </MyChakraProvider>;
}

export default App

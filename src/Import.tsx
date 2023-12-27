import { ForwardedRef, forwardRef, useState } from 'react'
import {
  Input,
  Button,
  Icon,
  IconButton,
  IconButtonProps,
  Text,

  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,

  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { Select } from "chakra-react-select";
import { CiImport } from "react-icons/ci";

import { Glosa } from './types';

type ImportProps = Omit<IconButtonProps, "aria-label">

const Import = forwardRef((props: ImportProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tags, setTags] = useState<Array<{label: string, value: string}>>([]);
  const [url, setUrl] = useState<string>('');
  const [newCandidate, setNewCandidate] = useState<{label: string, value: string}>();
  const staticVocab = JSON.parse(window.localStorage.getItem('vocab') || '');
  const [vocab] = useState<Array<Glosa>>(staticVocab);
  const [result, setResult] = useState<{message: string, error: string}>();
  const availableTags = Object.keys(vocab.reduce((p, g) => {
    return {
      ...g.tags.reduce((p1, g1) => ({...p1, [g1]: 1}), {}),
      ...p
    }
  }, {}
  )).map(t => ({label: t, value: t}));

  const importVocab = async () => {
    try {
      const request = await fetch(url);
      const response: Array<Glosa> = await request.json();

      response.forEach(glosa => {
        const exists = vocab.find(v => v.words[0] === glosa.words[0] && v.words[1] === glosa.words[1]);
        if (!exists) {
          glosa.tags = [...glosa.tags, ...tags.map(t => t.value)];
          glosa.tags = glosa.tags.filter((t, i) => glosa.tags.indexOf(t) === i);
          vocab.push(glosa);
        } else {
          exists.tags = [...exists.tags, ...glosa.tags, ...tags.map(t => t.value)];
          exists.tags = exists.tags.filter((t, i) => exists.tags.indexOf(t) === i);
        }
      });
      const vocabStr = JSON.stringify(vocab);
      window.localStorage.setItem('vocab', vocabStr);
      window.location.hash = vocabStr;
    } catch(e) {
      console.error(e);
      setResult({
        message: `Couldn't import Vocabulary from url ${url}`,
        error: (e as Error).message,
      });
    }
  }
  return (<>
    <Text onClick={onOpen}>
      <IconButton
        ref={ref}
        size="md"
        fontSize="lg"
        variant="ghost"
        color="current"
        marginLeft="2"
        icon={<Icon as={CiImport} />}
        aria-label={`Settings`}
        {...props}
      />
    </Text>

    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <Input placeholder="Url to the data to import" value={url} onChange={(e) => setUrl(e.target.value)}/>
            <Select
              placeholder="Choose wordgroups"
              size="md"
              isMulti 
              variant="unstyled"
              value={tags}
              onChange={(value) => {
                const newTags: Array<{value: string, label: string}> = [...value].filter(v => v.value !== 'newgroup');
                if (newCandidate && value.length !== newTags.length) {
                  newTags.push(newCandidate);
                }
                setTags(newTags);
              }}
              filterOption={(candidate: {value: string, label: string}, input: string) => {
                setTimeout(() => setNewCandidate({label: input, value: input}), 100);
                if (candidate.value === 'newgroup' && !input) return false;
                return (
                  candidate.value.includes(input) ||
                  candidate.label.includes(input) || 
                  (!availableTags.find(t => t.value === input) && candidate.value === 'newgroup')
                );
              }}
              options={[...availableTags, {label: 'New group', value: 'newgroup'}]}
            />
            <Button onClick={importVocab}>Import Vocabulary</Button>
            {result && <Alert status="error">
              <AlertIcon />
              <AlertTitle>{result.message}</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  </>);
});

export default Import;

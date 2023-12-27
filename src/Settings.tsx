import { useState, useEffect, ChangeEvent } from 'react'
import {Input} from '@chakra-ui/react'
import {
  Text,
  Tag,
  Button,
  Icon,
  IconButton,

  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,

  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,

  HStack,
} from '@chakra-ui/react'
import { FiSettings, FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import {
  Select,
} from "chakra-react-select";

import { Glosa } from './types'

export default function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const staticVocab = JSON.parse(window.localStorage.getItem('vocab') || '');
  const [vocab, setVocab] = useState<Array<Glosa>>(staticVocab);
  const [editRow, setEditRow] = useState<number | undefined>();
  const [word1, setWord1] = useState<string>('');
  const [word2, setWord2] = useState<string>('');
  const [tags, setTags] = useState<Array<{label: string, value: string}>>([]);
  const [newCandidate, setNewCandidate] = useState<{label: string, value: string}>();
  const [newWord1, setNewWord1] = useState<string>('');
  const [newWord2, setNewWord2] = useState<string>('');
  const [newTags, setNewTags] = useState<Array<{label: string, value: string}>>([]);
  const availableTags = Object.keys(vocab.reduce((p, g) => {
    return {
      ...g.tags.reduce((p1, g1) => ({...p1, [g1]: 1}), {}),
      ...p
    }
  }, {}
  )).map(t => ({label: t, value: t}));

  const updateVocab = () => {
    setTimeout(() => {
      const staticVocab = JSON.parse(window.localStorage.getItem('vocab') || '');
      setEditRow(-1);
      setWord1('');
      setWord2('');
      setTags([]);
      setNewCandidate(undefined);
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

    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vocabulary</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer overflowY="auto">
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Word to translate</Th>
                  <Th>Correct transaltion</Th>
                  <Th>Word Groups</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {vocab.map((g: Glosa, i: number) => (
                  <Tr key={i}>
                    {i !== editRow && (<>
                      <Td><Text>{g.words[0]}</Text></Td>
                      <Td><Text>{g.words[1]}</Text></Td>
                      <Td><HStack>{g.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</HStack></Td>
                    </>)}
                    {i === editRow && <>
                      <Td>
                        <Input
                          value={word1}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setWord1(e.target?.value)}
                          variant='filled'
                        />
                      </Td>
                      <Td>
                        <Input
                          value={word2}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setWord2(e.target?.value)}
                          variant='filled'
                        />
                      </Td>
                      <Td>
                        <Select
                          placeholder="Choose wordgroups"
                          size="md"
                          isMulti 
                          variant="unstyled"
                          chakraStyles={{
                            dropdownIndicator: (provided) => ({
                              ...provided,
                              display: 'none',
                            }),
                            menuList: (provided) => ({
                              ...provided,
                              maxHeight: '200px',
                            })
                          }}
                          value={tags}
                          onChange={(value) => {
                            const newTags: Array<{value: string, label: string}> = [...value].filter(v => v.value !== 'newgroup');
                            if (newCandidate && value.find(v => v.value === 'newgroup')) {
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
                      </Td>
                    </>}
                    <Td>
                      {editRow === i && <IconButton
                        size="md"
                        fontSize="lg"
                        variant="ghost"
                        color="current"
                        marginLeft="2"
                        onClick={() => {window.location.hash = JSON.stringify({action: 'delete', index: i});}}
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
                            window.location.hash = JSON.stringify({
                              action: 'replace',
                              index: i,
                              value: {
                                words: [word1, word2],
                                tags: tags.map(t => t.value)
                              }
                            }); // `${word1}=${word2}=${i}`;
                          } else {
                            setEditRow(i);
                            setWord1(g.words[0]);
                            setWord2(g.words[1]);
                            setTags(g.tags.map(t => ({label: t, value: t})));
                            setNewCandidate(undefined);
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
                    <Select
                      placeholder="Choose wordgroups"
                      size="md"
                      isMulti 
                      variant="unstyled"
                      chakraStyles={{
                        dropdownIndicator: (provided) => ({
                            ...provided,
                            display: 'none',
                          }),
                        }
                      }
                      value={newTags}
                      onChange={(value) => {
                        const newTags: Array<{value: string, label: string}> = value.filter(v => v.value !== 'newgroup');
                        if (newCandidate && value.find(v => v.value === 'newgroup')) {
                          newTags.push(newCandidate);
                        }
                        setNewTags(newTags);
                      }}
                      filterOption={(candidate: {value: string, label: string}, input: string) => {
                        setTimeout(() => setNewCandidate({label: input, value: input}), 100);
                        return candidate.value === 'newgroup' && !input ? false : true
                      }}
                      options={[...availableTags, {label: 'New group', value: 'newgroup'}]}
                    />
                  </Td>
                  <Td>
                    <IconButton
                      size="md"
                      fontSize="lg"
                      variant="ghost"
                      color="current"
                      marginLeft="2"
                      onClick={() => {
                        window.location.hash = JSON.stringify({
                          action: 'create',
                          value: {words: [newWord1, newWord2], tags: newTags.map(t => t.value)}
                        }); // `${newWord1}=${newWord2}`;}}
                      }}
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



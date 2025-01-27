import { atom } from 'jotai';

// Atom factory function
export function createLectureAtom(initialValue) {
  return atom(initialValue);
}

export function createDescriptionAtom(initialValue) {
  return atom(initialValue);
}

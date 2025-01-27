import { atom } from 'jotai';
import demoGif2 from '/images/pushupVecs.gif';
import demoGif from '/images/chinupVecs.gif';

// Initial data for workouts state
export const correctForm = {
  demo: demoGif2,
  description:
    'Correct exercise form description: e.g., Shoulder blades are depressed downwards',
};
export const wrongForm = {
  demo: demoGif2,
  description:
    'Wrong exercise form description: e.g., Shoulder blades not retracting',
};
// let nextWorkoutId = 1;
// let nextCorrectFormId = 1;
// let nextWrongFormId = 1;

export const initialWorkoutData = {
  id: 0,
  exercise: 'Your Description here ',
  demo: demoGif,
  correctForm: [
    {
      id: 0,
      ...correctForm,
    },
  ],
  wrongForm: [
    {
      id: 0,
      ...wrongForm,
    },
  ],
};

export const workoutsAtom = atom([initialWorkoutData]);

import { atom } from 'jotai';
import demoGif from '/images/chinupVecs.gif';
import { correctForm, wrongForm } from './workoutsAtom';

const section1 = {
  heading: 'e.g., Phase 1: Preparation or Week 1-4: Preparation',
};
const sectionItem1 = {
  lecture: '',
  description:
    ' Your Description here: Lorem ipsum dolor sit amet, Aenean commodo ligula eget dolor.',
  heading: 'Your own item header here: e.g., ReadMe or Lecture',
  workouts: [
    // {
    //     id : ,
    //     demo: demoGif,
    //     exercise: '',
    //     correctForm : [{
    //         id : ,
    //         ...correctForm
    //     }],
    //     wrongForm: [{
    //         id : ,
    //         ...wrongForm
    //     }]
    // }
  ],
};
const sectionItem2 = {
  lecture: '',
  description:
    'Lorem ipsum dolor sit amet, Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.',
  heading: 'Workout Routine',
  workouts: [
    {
      id: 3,
      demo: demoGif,
      exercise: `
            <p>e.g., Chin Ups</p> <br>
            <p>setsXreps: 3x8 </p> <br>
            <p> tempo: 1 sec concentric (upward movement) <p> <br>
            <p>2 sec eccentric (downward movement) etc</p>
            
            `,
      correctForm: [],
      wrongForm: [],
    },
  ],
};

// workout routine or the video lecture
const initialSectionData = [
  {
    id: 0,
    heading: section1.heading,
    items: [
      {
        id: 1,
        ...sectionItem1,
      },
      {
        id: 2,
        ...sectionItem2,
      },
    ],
  },
];

export const accordionsAtom = atom(initialSectionData);

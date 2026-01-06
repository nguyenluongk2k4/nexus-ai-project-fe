export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Which Python data structure is best suited for implementing a LIFO (Last In, First Out) structure?',
    options: ['List', 'Dictionary', 'Set', 'Tuple'],
    correctAnswer: 0,
    topic: 'Python Fundamentals'
  },
  {
    id: 2,
    question: 'What is the time complexity of searching for an element in a balanced binary search tree?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswer: 1,
    topic: 'Algorithms'
  },
  {
    id: 3,
    question: 'In machine learning, what is the primary purpose of a validation set?',
    options: [
      'To train the model',
      'To tune hyperparameters',
      'To test final performance',
      'To collect more data'
    ],
    correctAnswer: 1,
    topic: 'Machine Learning'
  }
];

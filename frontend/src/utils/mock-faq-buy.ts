import { FAQ } from '@/app/create-listing/faq-generator';

export const MOCK_FAQ_BUY: FAQ[] = [
  {
    id: Date.now().toString(),
    question: 'What condition are you looking for?',
    answer: 'I prefer gently used to new condition. Minor wear is acceptable if reflected in the price. The item must have no major defects, sole separation, or structural damage.'
  },
  {
    id: (Date.now() + 1).toString(),
    question: 'Do you need the original box and accessories?',
    answer: 'Original box and accessories are preferred but not mandatory. Items with complete packaging may be valued higher within my budget range.'
  },
  {
    id: (Date.now() + 2).toString(),
    question: 'What sizes are you interested in?',
    answer: 'I\'m open to various sizes. Please specify the size you have available when making an offer.'
  }
];

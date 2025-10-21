import { FAQ } from '@/app/create-listing/faq-generator';

export const MOCK_FAQ_SELL: FAQ[] = [
    {
    id: Date.now().toString(),
    question: 'Is the item authentic?',
    answer: 'Yes, all items listed are guaranteed to be 100% authentic. I can provide proof of purchase or authentication certificates upon request.'
    },
    {
    id: (Date.now() + 1).toString(),
    question: 'What is the return policy?',
    answer: 'Returns are accepted within 3 days of delivery if the item is not as described. The item must be in the same condition as received. Return shipping costs are covered by the buyer unless the item has defects.'
    },
    {
    id: (Date.now() + 2).toString(),
    question: 'How quickly can you ship?',
    answer: 'I typically ship within 1-2 business days after receiving payment. You will receive tracking information once the item is shipped.'
    }
];
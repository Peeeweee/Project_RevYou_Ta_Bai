import generalQuestions from './questions.json';
import jsBasics from './javascript_basics.json';

// Registry of available decks
// Keys are the display names
export const AVAILABLE_DECKS = [
    { name: "General Knowledge", data: generalQuestions, id: "deck_general" },
    { name: "JavaScript Basics", data: jsBasics, id: "deck_js" }
];

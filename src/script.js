import { bip39DotMap } from './bip39_dotmap.js'

const BIP39_DOTMAP = (function () {
    // Split the input into rows and remove any leading/trailing whitespace
    const rows = bip39DotMap.trim().split('\n');
    // Skip the header and separator rows
    const dataRows = rows.slice(2);

    // Process each row to extract the relevant data
    const result = dataRows.map(row => {
        // Split the row into columns based on the pipe symbol and trim whitespace
        const columns = row.split('|').map(col => col.trim()).filter(col => col);
        // Ensure the row has the expected number of columns
        if (columns.length >= 5) {
            const [index, word, col1, col2, col3] = columns;
            return { word, col1, col2, col3 };
        }
        // Return null for rows that don't have the expected format
        return null;
    }).filter(item => item !== null); // Filter out any null entries

    return result;
})();


document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const wordInput = document.getElementById('word');

    const getCheckboxState = column =>
        Array.from({ length: 4 }, (_, i) => document.getElementById(`col${column}box${i + 1}`).checked ? "●" : "○").join("");

    const setCheckboxState = (column, state) =>
        state.split('').forEach((char, i) =>
            document.getElementById(`col${column}box${i + 1}`).checked = char === "●");

    const updateWord = () => {
        const states = [1, 2, 3].map(getCheckboxState);
        const foundWord = BIP39_DOTMAP.find(
            item => states.every((state, index) => item[`col${index + 1}`] === state)
        );
        wordInput.value = foundWord ? foundWord.word : "";
    };

    const updateCheckboxes = () => {
        const word = wordInput.value.toLowerCase();
        const foundItem = BIP39_DOTMAP.find(item => item.word.toLowerCase() === word);

        [1, 2, 3].forEach(column =>
            setCheckboxState(column, foundItem ? foundItem[`col${column}`] : "○○○○")
        );
    };

    checkboxes.forEach(checkbox => checkbox.addEventListener('change', updateWord));
    wordInput.addEventListener('input', updateCheckboxes);

    updateWord();
});
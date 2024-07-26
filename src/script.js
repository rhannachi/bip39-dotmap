const { bip39DotMap } = require('./bip39_dotmap');

const BIP39_DOTMAP = (function () {
    // Split the input into rows
    const rows = bip39DotMap.trim().split('\n');

    // Initialize an empty array to hold the result
    const result = [];

    // Loop through each row, starting from index 2 to skip header and separator
    for (let i = 2; i < rows.length; i++) {
        // Split each row into columns based on the pipe symbol
        const columns = rows[i].split('|').map(col => col.trim()).filter(col => col);

        // Extract data from columns
        if (columns.length >= 5) {
            const word = columns[1];
            const col1 = columns[2];
            const col2 = columns[3];
            const col3 = columns[4];

            // Push the formatted object to the result array
            result.push({ word, col1, col2, col3 });
        }
    }

    return result;
})();


document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const wordInput = document.getElementById('word');

    function getCheckboxState(column) {
        let state = "";
        for (let i = 1; i <= 4; i++) {
            const checkbox = document.getElementById(`col${column}box${i}`);
            state += checkbox.checked ? "●" : "○";
        }
        return state;
    }

    function updateWord() {
        const col1State = getCheckboxState(1);
        const col2State = getCheckboxState(2);
        const col3State = getCheckboxState(3);

        const foundWord = BIP39_DOTMAP.find(
            item => item.col1 === col1State && item.col2 === col2State && item.col3 === col3State
        );

        wordInput.value = foundWord ? foundWord.word : "";
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateWord);
    });

    updateWord();
});

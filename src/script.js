'use strict';

import { bip39DotMap } from './bip39_dotmap.js'
import { BIP39Colors } from './script_bip39_colors.js'

document.addEventListener('DOMContentLoaded', () => {
    const BIP39_DOTMAP = parseDotMap(bip39DotMap);
    setupDotMap(BIP39_DOTMAP);
    setupColorHandling();
});

function parseDotMap(dotMap) {
    const rows = dotMap.trim().split('\n').slice(2);
    return rows.map(row => {
        const columns = row.split('|').map(col => col.trim()).filter(col => col);
        if (columns.length >= 5) {
            const [index, word, col1, col2, col3] = columns;
            return { word, col1, col2, col3 };
        }
        return null;
    }).filter(item => item !== null);
}

function setupDotMap(dotMap) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const wordInput = document.getElementById('word');

    const getCheckboxState = column =>
        Array.from({ length: 4 }, (_, i) => document.getElementById(`col${column}box${i + 1}`).checked ? "●" : "○").join("");

    const setCheckboxState = (column, state) =>
        state.split('').forEach((char, i) =>
            document.getElementById(`col${column}box${i + 1}`).checked = char === "●");

    const updateWord = () => {
        const states = [1, 2, 3].map(getCheckboxState);
        const foundWord = dotMap.find(item => states.every((state, index) => item[`col${index + 1}`] === state));
        wordInput.value = foundWord ? foundWord.word : "";
    };

    const updateCheckboxes = () => {
        const word = wordInput.value.toLowerCase();
        const foundItem = dotMap.find(item => item.word.toLowerCase() === word);
        [1, 2, 3].forEach(column => setCheckboxState(column, foundItem ? foundItem[`col${column}`] : "○○○○"));
    };

    checkboxes.forEach(checkbox => checkbox.addEventListener('change', updateWord));
    wordInput.addEventListener('input', updateCheckboxes);

    updateWord();
}

function setupColorHandling() {
    const seedInput = document.getElementById('seed');
    const colorContainer = document.getElementById('colorContainer');

    seedInput.addEventListener('input', () => {
        const seed = seedInput.value;
        const colors = seedToColors(seed);

        while (colorContainer.firstChild) {
            colorContainer.removeChild(colorContainer.firstChild);
        }

        colors.forEach(color => {
            if (isValidHexColor(color)) {
                addNewColorBox(color);
            }
        });

        addNewColorBox('');
    });

    colorContainer.addEventListener('input', (event) => {
        const divColorBox = colorContainer.querySelectorAll('.color-box');
        divColorBox.forEach(div => {
            const color = div.getElementsByClassName('color-input')[0].value.trim();
            div.style.background = color;
        });

        const inputsColors = colorContainer.querySelectorAll('.color-input');
        updateSeedFromColors(inputsColors);
    });

    function addNewColorBox(color) {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.background = color;

        const colorInput = document.createElement('input');
        colorInput.className = 'color-input';
        colorInput.value = color;
        colorInput.placeholder = '#000000';

        colorBox.appendChild(colorInput);
        colorContainer.appendChild(colorBox);
    }

    function removeColorBox() {
        const colorBoxes = colorContainer.querySelectorAll('.color-box');
        if (colorBoxes.length > 0) {
            const lastColorBox = colorBoxes[colorBoxes.length - 1];
            lastColorBox.remove();
        }
    }

    function updateSeedFromColors(inputs) {
        const colors = [];
        let nvEmptyColorBox = 0;
        inputs.forEach(input => {
            const color = input.value.trim();
            if (color) {
                colors.push(color);
            } else {
                nvEmptyColorBox++;
            }
        });

        if (nvEmptyColorBox === 0) {
            addNewColorBox('');
        }
        if (nvEmptyColorBox > 1) {
            removeColorBox();
        }

        const seed = colorsToSeed(colors);
        if (seed) {
            seedInput.value = seed;
        }
    }
}

function seedToColors(mnemonic) {
    const error = document.getElementById('error');
    if (BIP39Colors.fromSeed(mnemonic)) {
        error.innerText = ""
        return BIP39Colors.colors;
    } else {
        error.innerText = BIP39Colors.getError();
        return [];
    }
}

function colorsToSeed(colors) {
    const error = document.getElementById('error');
    if (BIP39Colors.toSeed(colors.join(' '))) {
        error.innerText = ""
        return BIP39Colors.seed;
    } else {
        error.innerText = BIP39Colors.getError();
        return '';
    }
}

function isValidHexColor(hex) {
    const hexColorPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    return hexColorPattern.test(hex);
}
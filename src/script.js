'use strict';

import { bip39DotMap } from './bip39_dotmap.js'
import { BIP39Colors } from './script_bip39_colors.js'

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

document.addEventListener('DOMContentLoaded', () => {
    const BIP39_DOTMAP = parseDotMap(bip39DotMap);
    setupDotMap(BIP39_DOTMAP);
    setupColorHandling();
});

function setupDotMap(dotMap) {
    const seedInput = document.getElementById('seed_dotmap');
    const dotmapsContainer = document.getElementById('dotmaps');

    const createCheckboxGroup = (columnStates, wordIndex, columnIndex) => {
        const checkboxGroup = document.createElement('td');
        checkboxGroup.className = 'td-checkbox-group';
        columnStates.split('').forEach((state, i) => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `word${wordIndex}col${columnIndex}box${i + 1}`;
            checkbox.checked = state === '●';
            checkbox.addEventListener('change', updateSeed);
            checkboxGroup.appendChild(checkbox);
        });
        return checkboxGroup;
    };

    const addEmptyCheckboxRow = () => {
        const seed = seedInput.value.toLowerCase().split(' ')
        const wordIndex = seed?.length ?? 0
        const wordContainer = document.createElement('tr');
        wordContainer.className = 'word-td';
        wordContainer.appendChild(createCheckboxGroup('○○○○', wordIndex, 1));
        wordContainer.appendChild(createCheckboxGroup('○○○○', wordIndex, 2));
        wordContainer.appendChild(createCheckboxGroup('○○○○', wordIndex, 3));
        dotmapsContainer.appendChild(wordContainer);
    };

    const updateDotmaps = () => {
        const seed = seedInput.value.toLowerCase().split(' '); // Split the seed into individual words
        dotmapsContainer.innerHTML = ''; // Clear previous dotmaps

        seed.forEach((word, wordIndex) => {
            const foundItem = dotMap.find(item => item.word.toLowerCase() === word);
            if (foundItem) {
                const wordContainer = document.createElement('tr');
                wordContainer.className = 'word-td';
                wordContainer.appendChild(createCheckboxGroup(foundItem.col1, wordIndex, 1));
                wordContainer.appendChild(createCheckboxGroup(foundItem.col2, wordIndex, 2));
                wordContainer.appendChild(createCheckboxGroup(foundItem.col3, wordIndex, 3));
                dotmapsContainer.appendChild(wordContainer);
            }
        });

        // Always add an empty row at the end
        addEmptyCheckboxRow();
    };

    const updateSeed = () => {
        const words = [];
        const wordContainers = dotmapsContainer.querySelectorAll('.word-td');
        wordContainers.forEach((wordContainer, wordIndex) => {
            const states = [1, 2, 3].map(columnIndex =>
                Array.from({ length: 4 }, (_, i) =>
                    document.getElementById(`word${wordIndex}col${columnIndex}box${i + 1}`).checked ? '●' : '○'
                ).join('')
            );
            const foundItem = dotMap.find(item =>
                states.every((state, index) => item[`col${index + 1}`] === state)
            );
            if (foundItem) {
                words.push(foundItem.word);
            }
        });
        seedInput.value = words.join(' ');
    };

    seedInput.addEventListener('input', updateDotmaps);
    updateDotmaps();
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
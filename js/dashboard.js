let dataStore = {};

function processGettingCharacters() {
    updateCharactersButton();
    API.getCharacters((characters)=>{
        dataStore.characters = characters;
        loadCharacters(characters)
    });
}

function createCharacterElement(character) {
    let container = document.createElement('div');
    // const id = 'character-'+ character['id'];
    // container.id = id;
    let name = document.createElement('h3');
    // For each element on a character add
    let containerDetails = Object.entries(character)
        .filter((entries) => { return entries[0] !== "id" && entries[0] !== "name"})
        .map((entries) => {
            let label = document.createElement('span');
            let data = document.createElement('span');
            label.innerText = entries[0] + ": ";
            data.innerText = entries[1];
            let infoContainer = document.createElement('p');
            infoContainer.appendChild(label);
            infoContainer.appendChild(data);
            return infoContainer;
        });
    let editBtn = document.createElement('button');

    editBtn.addEventListener('click', function() {
        let modalBody = createEditCharacterModal(character);

        // Show a pop up modal with the information about the character
        openModal(
            {
                onOkay: ()=>{
                    API.updateCharacter(getCharacter(character.id), processGettingCharacters);
                }, 
                bodyHtml: modalBody, 
                headerName: character.name
            })
    });

    editBtn.innerText = 'Edit';
    editBtn.classList.add('btn', 'btn-primary');
    name.innerHTML = character.name;
    containerDetails.unshift(name);
    containerDetails.push(editBtn);
    container.replaceChildren(...containerDetails);

    return container;
    
}

function sortCharacters() {

}

function loadCharacters(characters) {
    let charactersContainer = document.querySelector('#characters-container');
    let characterElements = [];
    characters.forEach(character => {
        characterElements.push(createCharacterElement(character));
    });
    charactersContainer.innerHTML = '';
    charactersContainer.replaceChildren(...characterElements);
}

function updateCharactersButton() {
    let characterBtn = document.querySelector('#get-characters-btn');
    characterBtn.innerText = 'Refresh Characters';
}

// =================== Single Character Modal =====================

function getCharacter(id) { // TODO Put this code into a class for dataStore that will let you do this.
    let index = dataStore.characters.findIndex(character => character['id'] === id);
    return dataStore.characters[index];
}

function createEditCharacterModal(character) {
    let modalBody = document.createElement('div');

    function addEntry(entry, path) {
        let label = entry[0];
        let value = entry[1];
        let newPath = [...path, label];
        let field = document.createElement('div');
        if (typeof value !== 'object') {
            const id = label + '-' + crypto.randomUUID();
            let valueType = typeof value === 'number' ? 'number' : 'text';
            field.innerHTML = `
                <label for='${id}'>${label}: </label>
                <input id='${id}' type='${valueType}' value='${value}'>
            `;
            let input = field.querySelector('#'+id);
            input.addEventListener('change', (e)=>{
                let index = dataStore.characters.findIndex(char => char.id === character.id)
                let newValue = input.type === 'number' ? Number(input.value) : String(input.value) 
                dataStore.characters[index] = updateField(newPath, character, newValue);
                console.log(dataStore.characters[index]);
            });
        } else {

            field.innerHTML = `<p>${label}: </p>`;
            Object.entries(value).forEach(nestedEntry => {
                field.appendChild(addEntry(nestedEntry, newPath));
            })
        }

        return field;
    };

    Object.entries(character)
        .filter((entries) => { return entries[0] !== "id" })
        .forEach((entries) => {
            modalBody.appendChild(addEntry(entries, []));
    });
    return modalBody;
    
}

// Recursively follow the path to the field in question and update the value, then rebuild the structure as you return
function updateField(steps, currentStructure, newValue) {
    let newStructure = currentStructure;
    let stepsCopy = [...steps];
    let nextStep = stepsCopy.shift();
    let currentValue = newStructure[nextStep];
    if (typeof currentValue !== 'object') {
        newStructure[nextStep] = newValue
    } else {
        newStructure[nextStep] = updateField(stepsCopy, newStructure[nextStep], newValue);
    }
    return newStructure;
}

// =================== Create New Character ======================


function createNewCharacter() {
    a = Array.from(document.querySelector('#character-form').children).filter(el => el.tagName === 'DIV').map(div => { return [div.querySelector('input').id, div.querySelector('input').value]} );
    console.log(a);
    c=a.map(ch=> {
        return [ch[0].split('character-')[1],ch[1]];
    })
    char={};
    c.forEach(el=> {
        if (el[0].includes('-')) {
            chain =el[0].split('-');
            if (char[chain[0]] === undefined) char[chain[0]] = {}
            char[chain[0]][chain[1]]=el[1];
        } else { char[el[0]]=el[1] }
    });
    console.log(char);
    API.createCharacter(char, (character)=> {console.log('character',character)}, ()=>{quickMessage('Failed to create character', {time: 5000, enabled: true})})
}
        

async function importCharacter() {
    const inputFile = document.querySelector('#character-import-file');
    file = await readFile(inputFile.files[0]);
    
    const textArea = document.createElement('textarea');
    Object.assign(textArea.style, {
        'width': '100%',
        'min-height': '400px',
        'margin': '1rem 0'
    });
    textArea.value = file;
    // Process the file content here
    openModal({
        onOkay: ()=>{
            try {
                let characterImport = JSON.parse(textArea.value);
                console.log('import data', characterImport);

                if (Array.isArray(characterImport)) {
                    characterImport.forEach(character => {
                        API.createCharacter(character, (res)=> {
                            console.log('success', res);
                        });
                    })
                }




            } catch (err) {
                console.error('Issue Importing: ', err);
                quickMessage('Invalid Data', {time: 0, enabled: false});
            }
        }, 
        bodyHtml: textArea, 
        headerName: 'Confirm Import File Contents'
    }) 
    
}


// =================== On Load Run Code Below ====================

// Get the refresh token, and if the user isn't authorized send them ot the login page. Otherwise show the header navigation
setTimeout(() => {
    API.grabRefreshToken(()=>{insertHeaderNav('body')}, ()=>{redirect('/index.html')});
}, 100);
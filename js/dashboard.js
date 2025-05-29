let dataStore = {};

function processGettingCharacters() {
    updateCharactersButton();
    API.send('getCharacters').then(response => {
        if (response.ok) {
            response.json().then((characters)=>{
                dataStore.characters = characters;
                loadCharacters(characters)
            });
        } else {
            quickMessage(response.msg, {time: 5000, enabled: true}, 'error')
        }
    });
}

function createCharacterElement(character) {
    let container = document.createElement('div');
    container.classList.add('character-card');
    // const id = 'character-'+ character['id'];
    // container.id = id;
    let name = document.createElement('h3');
    // For each element on a character add
    let containerDetails = Object.entries(character)
        .filter(([key, value]) => { return key !== "id" && key !== "name"})
        .map(([key, value]) => {
            let label = document.createElement('span');
            let data = document.createElement('span');
            if (typeof value !== 'object') {
                label.innerText = key + ": ";

                if (typeof value === 'number' && value < 50) { // Just for fun
                    console.log('character-card', getComputedStyle(container));
                    data = document.createElement('div');
                    data.classList.add('character-card-bars-container');
                    let groupedBarsSize = 5;
                    for(let i=1; i< (Math.ceil(value/groupedBarsSize) + 1); i++) {
                        let groupedBars = document.createElement('div');
                        groupedBars.classList.add('character-card-grouped-bars');
                        let lastGroup = (i % Math.ceil(value/groupedBarsSize)) === 0;

                        for(let j=0; j<groupedBarsSize; j++) {
                            let bar = document.createElement('div');
                            if (lastGroup && value % groupedBarsSize > 0 && j >= (value % groupedBarsSize)) {
                                bar.classList.add('character-card-bar-default');
                            } else {
                                bar.classList.add('character-card-bar');
                            }
                            groupedBars.appendChild(bar);
                        }
                        data.appendChild(groupedBars);
                    }
                } else {
                    data.innerText = value;
                }
            } else {

            }
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
                bodyHtml: modalBody, 
                headerName: character.name,
                footerSettings: {
                    buttons: [
                        {
                            label: 'Update',
                            canClose: true,
                            includeIf: ['A','E'].includes(API.settings.role),
                            classes: ['btn', 'btn-primary'],
                            action: () => {
                                // TODO: Move authorization to the API. Possible solution - have all functions run through a initial function like API.send('nameOfAPIFunction', parameters)
                                
                                API.send('updateCharacter', getCharacter(character.id)).then(response => {
                                    if (response.ok) {
                                        processGettingCharacters();
                                    } else {
                                        quickMessage(response.msg, {time: 5000, enabled: true}, 'error');
                                    }
                                });
                            }
                        },
                        {
                            label: 'Delete',
                            canClose: true,
                            includeIf: ['A'].includes(API.settings.role),
                            classes: ['btn', 'btn-danger'],
                            action: () => {
                                API.send('deleteCharacter', character.id).then(response => {
                                    if (response.ok) {
                                        processGettingCharacters();
                                    } else {
                                        quickMessage(response.msg, {time: 5000, enabled: true}, 'error')
                                    }
                                });
                            }
                        },
                        {
                            label: 'Close',
                            canClose: true,
                            includeIf: true,
                            classes: ['btn', 'btn-secondary'],
                            action: () => {}
                        }
                        
                    ]
                }
            })
    });

    editBtn.innerText = 'View';
    editBtn.classList.add('btn', 'btn-primary');
    name.innerHTML = character.name;
    containerDetails.unshift(name);
    containerDetails.push(editBtn);
    container.replaceChildren(...containerDetails);

    return container;
    
}

function sortCharacters() { // TODO: Finish this

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
            if (['A','E'].includes(API.settings.role)) {
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
                field.innerHTML = `
                    <p>${label}: ${value}</p>
                `;
            }
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
    API.send('createCharacter', char).then(response => {
        if (response.ok) {
            response.json().then((character)=> {console.log('character',character)});
        } else { 
            quickMessage(response.msg, {time: 5000, enabled: true}, 'error');
        }
    });
    
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
        bodyHtml: textArea, 
        headerName: 'Confirm Import File Contents',
        footerSettings: {
            buttons: [
                {
                    label: 'Ok',
                    canClose: true,
                    includeIf: true,
                    classes: ['btn', 'btn-primary'],
                    action: () => {
                        try {
                            let characterImport = JSON.parse(textArea.value);
                            console.log('import data', characterImport);
            
                            if (Array.isArray(characterImport)) {
                                characterImport.forEach(character => {
                                    API.send('createCharacter', character).then(response => {
                                        if (response.ok) {
                                            response.json().then((res)=> {
                                                console.log('success', res);
                                            });
                                        } else {
                                            quickMessage(response.msg, {time: 5000, enabled: true}, 'error');
                                        }
                                    });
                                })
                            }
                        } catch (err) {
                            console.error('Issue Importing: ', err);
                            quickMessage('Invalid Data', {time: 0, enabled: false}, 'error');
                        }
                    }
                },
                {
                    label: 'Close',
                    canClose: true,
                    includeIf: true,
                    classes: ['btn', 'btn-secondary'],
                    action: () => {}
                }
                
            ]
        }
    }) 
    
}


// =================== On Load Run Code Below ====================

// Get the refresh token, and if the user isn't authorized send them ot the login page. Otherwise show the header navigation
setTimeout(() => {
        insertHeaderNav('body');
        API.send('grabRefreshToken')
        .then(response => {
            if (response.ok) {
                return API.send('getUserInfo');
            } else {
                redirect('/index.html');
                quickMessage(response.msg, {time: 5000, enabled: true}, 'error');
            }
        })
        .then( (res) => {
            console.log(res);
            // let data = await res.json();//.then((data)=> {
            //     console.log('data', data);
            // });
            return res.json();
        })
        .then(data => {
                console.log('json',data);
                console.log('userInfo', data);
        })
        .catch(err => {
            console.error('Error', err);
            quickMessage(err, {time: 5000, enabled: true}, 'error');
        });
    }
, 100);
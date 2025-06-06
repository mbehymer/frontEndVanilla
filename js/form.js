class Form {
    constructor(form, type) {
        if (type === 'object') {
            loadObject(form)
        } else if (type === 'fileName') {
            loadFile(form)
        }
    }

    form = {};

    loadObject = (objectForm) => {
        Object(objectForm).entries.forEach(([key, value]) => {
            if (key === 'fields') {
                value.forEach(field => {
                    this.generateField(field);
                })
            }
        });
    };

    generateField = (field) => {
        let div = document.createElement('div');
        div.classList.add('form-element dynamic');
        if (field.type === 'input') {
            div.innerHTML = `<label for="${field.id}>${field.label}</label><input id="${field.id}" type="${field.valueType}" value="{{}}">`;
        } else if (field.type = 'textarea') {
            div.innerHTML = `<textarea id="${field.id}">{{}}</textarea>`;
        }

    }

    loadFile = (file) => {
        
    }

}
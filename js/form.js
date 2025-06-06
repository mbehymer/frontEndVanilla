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
                    
                })
            }
        });
    };

    generateField = (field) => {
        let htmlField = ``;
        if (field.type === 'input') {
            htmlField = `<input type="${field.valueType}">`
        }
    }

    loadFile = (file) => {
        
    }

}
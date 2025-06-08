class Form {
    constructor(form, type) {
        if (type === 'object') {
            this.formHTML = (loadObject(form))
        } else if (type === 'fileName') {
            loadFile(form)
        }
    }

    form = {};
    formHTML;

    loadObject = (formObj) => {
        Object(formObj).entries.forEach(([key, value]) => {
            let container = document.createElement('div');
            container.classList.add(`form-element-container form-element-order-${formObj.displayOrder}`);
            let groupedItems = [];
            if (key === 'items') {
                value.forEach(item => {
                    if (item.objType === "field") {
                        groupedItems.push(this.generateField(item));
                    } else if (item.objType === "container") {
                        groupedItems.push(this.loadObject(item));
                    };
                });
            }
        });
    };

    generateField = (field) => {
        let div = document.createElement('div');
        div.classList.add(`form-element dynamic form-element-order-${field.displayOrder}`);
        if (field.type === 'input') {
            div.innerHTML = `<label for="${field.id}>${field.label}</label><input id="${field.id}" type="${field.valueType}" value="{{}}">`;
        } else if (field.type = 'textarea') {
            div.innerHTML = `<textarea id="${field.id}">{{}}</textarea>`;
        }
        return div;

    }

    loadFile = (file) => {
        
    }

}
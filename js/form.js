class Form {
    constructor(form, type) {
        if (type === 'object') {
            this.formHTML = this.loadObject(form);
            API.updateSettings(this.formHTML);
        } else if (type === 'fileName') {
            loadFile(form)
        }
    }

    form = {};
    formHTML;

    loadObject = (formObj) => {
        // let groupedItems = [];
        let container = document.createElement('div');
        container.classList.add(...["form-element-container", `form-element-order-${formObj.displayOrder}`]);
        Object.entries(formObj).forEach(([key, value]) => {
            // let groupedItems = [];
            if (key === 'items') {
                value.forEach(item => {
                    if (item.objType === "field") {
                        container.appendChild(this.generateField(item));
                    } else if (item.objType === "container") {
                        container.appendChild(this.loadObject(item));
                    };
                });
            }
            // sections.push(groupedItems);
        });
        return container;
    };

    generateField = (field) => {
        let div = document.createElement('div');
        div.classList.add(...["form-element-container", `form-element-order-${field.displayOrder}`]);
        if (field.type === 'input') {
            div.innerHTML = `<label for="${field.id}">${field.label}</label><input id="${field.id}"  class="dynamic" type="${field.valueType}" value="{{data.${field.id}}}">`;
        } else if (field.type = 'textarea') {
            div.innerHTML = `<textarea id="${field.id}">{{data?.${field.id}}}</textarea>`;
        }
        return div;

    }

    loadFile = (file) => {
        
    }

    // connectElements = (listOfElements) {

    //     listOfElements.forEach()
    // }

}
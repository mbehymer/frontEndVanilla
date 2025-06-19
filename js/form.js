class Form {
    constructor(form, type) {
        this.observer = new MutationObserver((mutationsList, observer) => {
            // console.log('field ID:', field.id);
            // console.log(mutationsList); // Process the changes here
            this.updateFormData(mutationsList.target);
        });
        if (type === 'object') {
            this.formHTML = this.loadObject(form);
            API.updateSettings(this.formHTML);
        } else if (type === 'fileName') {
            loadFile(form)
        }
    }

    observer;
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
                    } else if (item.objType === 'button') {
                        let btn = document.createElement('button');
                        btn.classList.add('btn', 'btn-primary');
                        btn.innerText = item.label;
                        btn.onclick = () => {
                            // item.action
                            // submit data
                            if (item.valueType === 'submit') {
                                console.log(this.form);
                            }
                            
                        }
                        container.appendChild(btn);
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
            div.innerHTML = `<label for="${field.id}">${field.label}</label><input id="${field.id}"  class="dynamic" type="${field.valueType}" value="{{user.${field.id}}}">`;
            
            let child = div.querySelector('input');
            child.addEventListener("input",  event => this.updateFormData(event.target));

        } else if (field.type = 'textarea') {
            div.innerHTML = `<textarea id="${field.id}" class="dynamic">{{user.${field.id}}}</textarea>`;
            
            let child = div.querySelector('textarea');;
            let config = { 
                childList: true, 
                characterData: true, 
                attributes: true 
            };
            this.observer.observe(child, config);
            child.addEventListener("input", event => this.updateFormData(event.target));
        }
        console.log(div.innerHTML);
        
        return div;

    }

    updateFormData = (field) => {
        if (!this.form.user) this.form.user = {};
        this.form.user[field.id] = field.value;
    }

    loadFile = (file) => {
        
    }

    // connectElements = (listOfElements) {

    //     listOfElements.forEach()
    // }

}
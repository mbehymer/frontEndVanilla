class Form {
    constructor(form, type) {
        this.observer = new MutationObserver((mutationsList, observer) => {
            // console.log('field ID:', field.id);
            // console.log(mutationsList); // Process the changes here
            this.updateFormData(mutationsList.target);
        });
        
        // this.getFormHTML(form, type); // FINISH THIS - Add ability to pass in an onload function
    }

    observer;
    form = {};
    formHTML;
    formRequests = {};
    getFormHTML = async (form, type) => {
        let requests = Object.entries(this.formRequests);
        if (!form && requests.length) return {ok: true};
        if (type === 'object') {
            // this.formRequests = Promise(this.loadObject(form));
            this.formHTML = await new Promise(this.loadObject(form));
            API.updateSettings(this.formHTML);
            return {ok: true};
        } else if (type === 'file') {
            this.formHTML = await this.loadFile(form);
            API.updateSettings(this.formHTML);
            return {ok: true};
        }
    }

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
            div.innerHTML = `<label for="${field.id}">${field.label}</label><textarea id="${field.id}" class="dynamic">{{user.${field.id}}}</textarea>`;
            
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

    loadFile = async (path) => {
        let file = await fetch(path)
        let obj = await file.json();
        return this.loadObject(obj);
    }

    // connectElements = (listOfElements) {

    //     listOfElements.forEach()
    // }

}
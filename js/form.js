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
    availableFunctions = {}
    

    _isAsync = (func) => {
        const AsyncFunction = (async () => {}).constructor;
        const GeneratorFunction = (function* () {}).constructor;

        return (func instanceof AsyncFunction && AsyncFunction !== Function && AsyncFunction !== GeneratorFunction) === true
    }

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

    loadAvailableFunctions = (...functions) => {
        functions.forEach(funcObj => {
            this.availableFunctions[funcObj.func.name] = funcObj;
        })
    }

    _parseParams = (...params) => {
        let parsedParams = []
        params.forEach(param => {
            if (param.type === 'self') { 
                let value = this;

                if (param.value.length !== '') { // if this is a specific field within the Form (because self is refering to the form), then we will need to find the specific value
                    param.value.split('.').forEach(path => {
                        value = value[path];
                    })
                }
                parsedParams.push(value);
                // parsedParams.push(param.value.length === '' ? this : this[param.value]);
            } else {
                parsedParams.push(param.value);
            }
        })
        return parsedParams;
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
                    } else if (item.objType === 'button') { // if the type of object is 'button' then set things up so that it can pass in the action
                        let btn = document.createElement('button');
                        btn.classList.add('btn', 'btn-primary');
                        btn.innerText = item.label;
                        btn.onclick = () => {
                            
                            // submit data
                            if (item.valueType === 'submit') {
                                // if (item.actionContainer === 'API') {
                                let funcObj = this.availableFunctions[item.actionInfo.action]
                                let func = funcObj.func;
                                let isAsync = this._isAsync(funcObj.func);

                                if (isAsync) {
                                    func(...this._parseParams(...item.actionInfo.params)).then(res => { // Finish setting this up. I should pass in functions that are possible when I create the form.
                                        if (res.ok) {
                                            quickMessage('Submission Successful', {time: 5000, enabled: true});
                                        } else {
                                            quickMessage('Submission Unsuccessful', {time: 5000, enabled: true}, 'error');
                                        }
                                    })
                                }
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
# frontEndVanilla

## Connect to NodeJSServer

I use this to interact with the server


### TODO
 -- Fix How the viewManager works, I think it would be good to have it work with components rather than just rendering the whole page.
 -- Rework how the entire App is working so that I can include an agent view pair (basically a set of Javascript code and a template of HTML for that specific piece)
 -- Finish working on the form to get that working so that it will only show information in the fields if the user already has values there. Otherwise it should be blank. Also work on the form so that it will submit be able to submit the data and do so correctly

#### Problems to think through:
Currently the manageTemplate file grabs the html for the page from a specified file. It also stores that file in memory so that if updates are made to the page and there are dynamic fields in the template then I can still update those fields. If I don't do this I won't be able to update the dynamic fields with new data. The issue is that when these fields are updated, it references the original file that was stored in memory and thus if I have a component that is added by some other module, that component will get overwritten. Here is another way of visualizing the data:


I have a field like this

```html
<div class="dynamic">{{data.someField}}</div>
<div id="some-type-of-form"></div>
```
The dynamic field is updated when an ServerConnection call is made that sets a value in the settings object. When it updates, it uses that code above as a template. A copy of the template is given to be updated and it updates the fields with the data from the settings object. If no data exists, the dynamic part {{...}} is removed. But since it always references the original, it always knows where to update when it receives the correct value.

The issue I have is that I also have things like that 
```html 
<div id="some-type-of-form"></div>
```
and this is added when a controller for the template page runs. It goes into a form.js file and adds a built out form from a javascript file into that div. This doesn't get updated like a dynamic field {{...}} but because the dynamic field always references the original file, it ends up overwritting the form code that was added to the form component.
I don't want to add the form update logic to the function that updates the dynamic fields as I feel like it's purpose is mainly for adding data to dynamic fields.
<!-- 
One thought for what I could do is add a property to components such that when the template file is grabbed it will add those to a list that upda -->
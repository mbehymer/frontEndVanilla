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
##### Option 1
Here is what I'm thinking at the moment. I think I could do something like this. I would have an object for each dynamic element, the ones with {{...}}. Using that I would have two versions of the html element. One would be the original un altered html element, and the other would be the element that gets updated and displayed. 

```json
{
    "originalElement": "<div>{{...}}</div>", // This would not be a string, but the actual reference to the element
    "updatedElement": "<div>Updated element with dynamic text</div>" // This would be the element that gets updated and displayed
}
```
How this would work is the code would receive an update to the object settings, then it would look at all of the objects, it would probably be a list, and it would check the originalElement to see if it has data that needs to be updated according to the changes that were made. If so it would copy the innerText of the element and update it, then update the updatedElement with the new innerHTML. This would mean we could update each different element, without replacing the whole existing HTML elements.

##### Option 2
Another idea, which isn't fully flushed out is that I could have everything load in a list, then store the values of the loaded components in their own lists and only update the lists that need to be updated, like the ones that have dynamic regions. Where I would setup that would probably be part of the template manager

##### Option 3
I don't like this option, but I could have each of the components re-render each time a dynamic field is updated. I feel like this would use way to many resources and be excessive, doing more than it needs to.

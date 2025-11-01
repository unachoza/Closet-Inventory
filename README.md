# Closet-Inventory

## Libraries Used

### Framer Motion

### challenges

React Race conditions, closing form and returning to overview before addItem posted to localStorage
https://framermotion.framer.website/documentation/introduction

when passing down props, is it better to write an inline function or create a function, and pass the function name

creating HOC / transposition
TextInputContainer into a compound component, which keeps the API flexible, declarative, and easy to extend (for instance, if you add icons, help text, or other sub-components later).

//CSS organization
positional formatting first,
followed by layout parameters,
then sizing
then colors
other text formatting properties.

.example-selector {
/_ Positioning _/
position: absolute;
top: 0;
left: 0;
z-index: 10;

/_ Display & Box Model _/
display: block;
width: 100%;
height: 200px;
padding: 1.25rem;
margin-bottom: 15px;
border: 1px solid #ccc;

/_ Visual Properties _/
background-color: #f0f0f0;
color: #333;
box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);

/_ Typography _/
font-family: sans-serif;
font-size: 16px;
line-height: 1.5;
text-align: center;

/_ Other _/
cursor: pointer;
}


Inner Soft Shadow Effect
https://www.codementor.io/@zara-z/how-to-make-an-inner-shadow-effect-with-css-1odkuw71cl
box-shadow: inset 6px 6px 10px 0 rgb(0,0,0, .5), inset -6px -6px 10px 0 rgb(255,255,255, .5)
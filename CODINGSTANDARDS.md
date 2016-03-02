# Coding Standards

## ALL Files
- 2 spaces per tab

## HTML Files
- Double quotes over single quotes for attributes
- Comment at closing of element where it closes via class i.e.
```HTML
<div class="row">
  ...
</div><!-- end: row -->
```

## Javascript Files
- Single quotes over double quotes
- Brackets immediately follow function/conditional for which they open i.e.
```JavaScript
var doStuff = function () {
  // Body of function
};

if (true) {
  // true
}
```
- Use semicolons when not required
- Conditionals must be on a new line from the closing previous one i.e.
```Javascript
if (true) {
  // true
}
else {
  // false
}
```
- Use '===' instead of '=='
```JavaScript
if (1 === 2)
```
...instead of...
```JavaScript
if (1 == 2)
```
- (optional) Comment code blocks are strongly encouraged, but not required for functions
```JavaScript
/**
 * Does foo with bar
 * @param {type} bar 
 * @returns {undefined}
 */
var foo = function (bar) {
  // Function body
};
```

## CSS Files
- Double quotes over single quotes where required
- Brackets immediately follow selector for which they open i.e.
```CSS
.selector {
  attribute: value;
}
```
- All colors should be in hexidecimal/ascii i.e.
```CSS
.selector {
  color: #FFFFFF;
  color: white;
}
```

document.addEventListener("DOMContentLoaded", function() {
    // Select the button
    const button = document.getElementById("myButton");

    // Programmatically trigger a click event on the button
    
    
    // Optional: Add an event listener to the button for the click event
    button.addEventListener("click", function() {
        alert("Button was clicked automatically when the page loaded!");
    });

    button.click();
});





// Mock DOM environment to run script.js in Node.js
const dreams = ["Learn to code", "Build projects", "Help others"];

// Mock document API
global.document = {
  getElementById: (id) => {
    if (id === "dreams") {
      return {
        firstElementChild: { remove: () => {} },
        appendChild: (elem) => {},
        children: []
      };
    }
    return null;
  },
  querySelector: (selector) => {
    if (selector === "form") {
      return {
        elements: {
          dream: { value: "New dream" }
        },
        addEventListener: (event, callback) => {
          console.log(`Form listener added for: ${event}`);
        },
        reset: () => console.log("Form reset"),
        focus: () => console.log("Form focused")
      };
    }
    return null;
  }
};

// Mock fetch API
global.fetch = (url) => {
  console.log(`Fetching: ${url}`);
  return Promise.resolve({
    json: () => Promise.resolve(dreams)
  });
};

// Mock createElement
document.createElement = (tag) => {
  return {
    innerText: "",
    appendChild: () => {}
  };
};

console.log("=== Running script.js with mocked DOM ===\n");

// Load and execute the original script.js
const fs = require('fs');
const scriptContent = fs.readFileSync('./script.js', 'utf8');
eval(scriptContent);

// Wait for async operations
setTimeout(() => {
  console.log("\n=== Execution complete ===");
  console.log("Dreams array:", dreams);
}, 1000);

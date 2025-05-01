/**
 * Function for consisely creating a chunk of HTML nodes
 * @param {string} tagName 
 * @param {Object | Map} attrs 
 * @param {HTMLElement[]} children 
 * @returns HTMLElement
 */
export const h = (tagName, attrs, children) => {
  const el = document.createElement(tagName);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el[key] = value;
    }
  }
  children?.forEach(child => el.appendChild(child));
  return el;
}

/**
 * Useful little template literal tagging function to make template strings behave more like JSX
 * taken almost verbatim from https://blog.jim-nielsen.com/2019/jsx-like-syntax-for-tagged-template-literals/
 * @param {string[]} strings 
 * @param {string[]} values 
 * @returns string
 */
export function jsx(strings, ...values) {
  let out = "";
  strings.forEach((string, i) => {
    const value = values[i];

    // Array - Join to string and output with value
    if (Array.isArray(value)) {
      out += string + value.join("");
    }
    // String - Output with value
    else if (typeof value === "string") {
      out += string + value;
    }
    // Number - Coerce to string and output with value
    // This would happen anyway, but for clarity's sake on what's happening here
    else if (typeof value === "number") {
      out += string + String(value);
    }
    // object, undefined, null, boolean - Don't output a value.
    else {
      out += string;
    }
  });
  return out;
};

/**
 * Utility function to wrap an array of things in an HTML list
 * @param {Array(string|object)} arrayOfThings the things to put in the list
 * @param {Boolean} isOrdered should output be an ordered or unordered list
 * @returns string of raw HTML
 */
export const listify = (arrayOfThings, isOrdered) => {
  return [
    isOrdered ? "<ol>" : "<ul>",
    ...arrayOfThings.map(i => `<li>${i}</li>`),
    isOrdered ? "</ol>" : "</ul>"
  ].join('\n');
}

export const pluralize = (quantity, thing) => {
  return jsx`
		${quantity} ${thing}${quantity !== 1 && 's'}
	`;
}

export const CreateSvg = (body, width, height, classNames = "") => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", "0 0 24 24");
  classNames && svg.setAttribute("class", classNames);
  svg.innerHTML = body;
  return svg;
};

// not intended to be fully-featured; I'll build it out as I need it
export const htmlToMarkdown = (html) => {
  let out = "";
  html.childNodes.forEach(nd => {
    if (nd.nodeType === Node.ELEMENT_NODE) {
      switch (nd.tagName) {
        case "P":
          out += `\n${htmlToMarkdown(nd)}\n`;
          break;
        case "STRONG":
          out += `*${nd.textContent}*`;
          break;
        case "UL":
          out += `\n\n${htmlToMarkdown(nd)}\n`;
          break;
        case "LI":
          out += `* ${htmlToMarkdown(nd)}\n`;
          break;
      }
    } else if (nd.nodeType == Node.TEXT_NODE) {
      out += nd.textContent;
    }
  });

  return out;
}


export const queryParams = (paramsObject) => {
  return '?' + Object.keys(paramsObject).map(k => `${k}=${paramsObject[k]}`).join('&');
}
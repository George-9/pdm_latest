import { domCreate } from "./query.js";

export function Row({ classes = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-row');

    if (classes) {
        div.classList.add(...classes)
    }

    if (styles) {
        for (let i = 0; i < Object.keys(styles).length; i++) {
            const style = Object.keys(styles)[i];
            div.style[style] = styles[style];
        }
    }

    if (children) {
        div.append(...children);
    }

    return div;
}


export function Column({ classes = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-col');

    if (classes) {
        if (classes.length && classes.length > 0) {
            for (let i = 0; i < classes.length; i++) {
                div.classList.add(classes[i])
            }
        }
    }

    if (styles) {
        for (let i = 0; i < Object.keys(styles).length; i++) {
            const style = Object.keys(styles)[i];
            div.style[style] = styles[style];
        }
    }

    if (children) {
        div.append(...children);
    }

    return div;
}


export function VerticalScrollView({ classes = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-col', 'scroll-y');

    if (classes) {
        div.classList.add(...classes)
    }

    if (styles) {
        for (let i = 0; i < Object.keys(styles).length; i++) {
            const style = Object.keys(styles)[i];
            div.style[style] = styles[style];
        }
    }

    if (children) {
        div.append(...children);
    }

    return div;
}


export function HorizontalScrollView({ classes = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-row', 'scroll-x');

    if (classes) {
        div.classList.add(...classes)
    }

    if (styles) {
        for (let i = 0; i < Object.keys(styles).length; i++) {
            const style = Object.keys(styles)[i];
            div.style[style] = styles[style];
        }
    }

    if (children) {
        div.append(...children);
    }

    return div;
}

export function MondoText({ text = '', styles = [] }) {
    var par = domCreate('p');
    par.style.margin = '3px';
    par.innerText = text;


    function setStyles() {
        if (styles && styles.length && styles.length > 0) {
            for (let i = 0; i < styles.length; i++) {
                const style = styles[i];
                const styleProperty = Object.keys(style)[0];
                par.style[styleProperty] = style[styleProperty];
            }
        }
        return true /** done */;
    }

    if (setStyles()) {
        return par;
    }
}
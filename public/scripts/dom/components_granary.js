import { domCreate } from "./query";

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


export function Row({ classes = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-col');

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


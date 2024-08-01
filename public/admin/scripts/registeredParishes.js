import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../tools/dom.js";
import { NetTool } from "../../tools/netTool.js"

window.onload = Main


async function Main() {
    LoadAndShowRegisteredParishes()
}

async function LoadAndShowRegisteredParishes() {
    const mainView = GET_EL_BY_ID('view');

    const parishes = await (await NetTool.POST_CLIENT(
        '/registered/parishes',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify({})
    )).json()

    console.log(parishes);



    for (const parishData of parishes) {

        const parishCont = CREATE_ELEMENT('div');
        parishCont.style.backgroundColor = 'royalblue';
        parishCont.style.color = 'white';
        parishCont.style.padding = '4px';
        // parishCont.style.margin = '1'

        const nameEl = CREATE_ELEMENT('p');
        // const emailEl = CREATE_ELEMENT('h2')

        const codeEl = CREATE_ELEMENT('p');

        nameEl.innerText = parishData['name'];
        codeEl.innerText = parishData['code'];

        parishCont.appendChild(nameEl);
        parishCont.appendChild(codeEl);
        parishCont.appendChild(CREATE_ELEMENT('hr'));

        mainView.appendChild(parishCont)
    }
}
import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../../tools/dom.js";
import { MessegePopup } from "../../../tools/messegePopup.js";
import { ModalExpertise } from "../../../tools/modal.js";
import { NetTool } from "../../../tools/netTool.js";
import { LocalStorageContract } from "../../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../../tools/stringUtils.js";


document.addEventListener('DOMContentLoaded', (ev) => {
    ev.preventDefault();

    PrepareDocumentForRegisterMember()
})

export function PrepareDocumentForRegisterMember() {
    let selectedOutstation, selectedSCC;

    const registerDiv = CREATE_ELEMENT('div');
    registerDiv.classList.add('full-width', 'flex-column', 'align-center');

    const entryDiv = CREATE_ELEMENT('div');
    entryDiv.classList.add('full-width', 'flex-column', 'align-center');

    const progress = CREATE_ELEMENT('progress');

    const sccsSelect = CREATE_ELEMENT('select');
    sccsSelect.id = 'scc';
    sccsSelect.style.width = '250px'
    sccsSelect.style.padding = '10px'


    sccsSelect.onchange = (ev) => {
        selectedSCC = ev.currentTarget.value;
    }

    const headerDiv = CREATE_ELEMENT('div');
    headerDiv.classList.add('flex-row', 'align-end', 'justify-center');

    const addNewFieldButton = CREATE_ELEMENT('button');
    addNewFieldButton.classList.add('btn-normal')
    addNewFieldButton.innerText = 'add field';
    addNewFieldButton.onclick = (ev) => {
        if (IS_NULL_OR_EMPTY((entryDiv.children[entryDiv.children.length - 1]).value)) {
            return;
        }

        const newFieldName = prompt('new field name, e.g. place of birth');
        if (IS_NULL_OR_EMPTY(newFieldName)) {
            return
        }

        const newEntry = CREATE_ELEMENT('input');
        newEntry.id = newFieldName.split(' ').join('_');
        newEntry.placeholder = newFieldName;


        entryDiv.appendChild(newEntry);
    }

    const submitButton = CREATE_ELEMENT('button');
    submitButton.classList.add('btn-normal')
    submitButton.innerText = 'complete registry';

    const nameI = CREATE_ELEMENT('input');
    nameI.id = 'name';
    nameI.placeholder = 'enter name';

    const homeAddressI = CREATE_ELEMENT('input');
    homeAddressI.id = 'home_address';
    homeAddressI.placeholder = 'home address';

    const dob = CREATE_ELEMENT('input');
    dob.id = 'dob'
    dob.setAttribute('type', 'date');

    const outstationsPicker = CREATE_ELEMENT('select');
    outstationsPicker.id = 'outstation'
    outstationsPicker.style.width = '250px'
    outstationsPicker.style.padding = '10px'

    const genderPicker = CREATE_ELEMENT('select');
    genderPicker.style.width = '250px'
    genderPicker.style.padding = '10px'

    genderPicker.id = 'gender';
    genderPicker.style.width = '200px';
    genderPicker.style.padding = '10px';
    const male = CREATE_ELEMENT('option');
    male.value = 'male';
    male.innerText = 'male';
    const female = CREATE_ELEMENT('option');
    female.innerText = 'female';
    female.value = 'female';

    genderPicker.append(male, female);

    entryDiv.append(nameI, dob, genderPicker, homeAddressI)
    registerDiv.appendChild(progress);

    headerDiv.append(addNewFieldButton, submitButton);
    const memberDetails = {};

    let outstationsResult
    const getAndSetOutstations = async () => {
        outstationsResult = await (await NetTool.POST_CLIENT('/get/outstations',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                'parish_id': LocalStorageContract.STORED_PARISH_CREDENTIALS()['id']
            })
        )).json();

        for await (const outstationData of outstationsResult) {
            const select = CREATE_ELEMENT('option');

            select.value = outstationData['name'];
            select.innerText = outstationData['name'];
            outstationsPicker.appendChild(select)
        }

        // new HTMLSelectElement().onchange = (ev) => {

        // }
        addNewFieldButton.classList.add('reg-btn');
        submitButton.classList.add('reg-btn');
        outstationsPicker.onchange = async (ev) => {
            sccsSelect.replaceChildren([]);

            const matchOutstation = outstationsResult.filter((outstation) => {
                selectedOutstation = outstation['name'];
                return outstation.name === ev.target.value;
            })[0];

            const sccs = matchOutstation.smallchristiancommunities

            for await (const scc of sccs) {
                const sccOpt = CREATE_ELEMENT('option')
                sccOpt.value = scc;
                sccOpt.innerHTML = scc;

                sccsSelect.appendChild(sccOpt);
            }
        }
    }

    submitButton.onclick = async (ev) => {
        ev.preventDefault();

        for await (const inputEntry of entryDiv.children) {
            if (ev.target.id === 'outstation' || ev.target.id === 'scc') {
                continue;
            }

            if (IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'name'
                ||
                IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'dob'
                ||
                IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'gender'
                ||
                IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'home_address'
            ) {
                return MessegePopup.ShowMessegePuppy('all basic fields must be filled, name to home address');
            }
            else if (IS_NULL_OR_EMPTY(inputEntry.value)) {
                continue;
            } else {
                memberDetails[inputEntry.id.toUpperCase().trim()] = inputEntry.value;
            }
        }
        const registrationResult = await (await NetTool.POST_CLIENT(
            '/register/member',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                ...memberDetails,
                'parish_id': LocalStorageContract.STORED_PARISH_ID(),
                'outstation': selectedOutstation,
                'scc': selectedSCC
            })
        )).json();

        MessegePopup.ShowMessegePuppy(registrationResult['response']);
        ModalExpertise.HideModal();
        window.location.reload()
    }

    registerDiv.style.backgroundColor = '#b79b9b';
    registerDiv.style.padding = '10px';
    registerDiv.style.borderRadius = '5px';
    GET_EL_BY_ID('main-div').appendChild(registerDiv);

    getAndSetOutstations().then(() => {
        registerDiv.removeChild(progress);

        registerDiv.append(headerDiv, entryDiv);
        registerDiv.appendChild(outstationsPicker)

        // entryDiv.appendChild(outstationsPicker)
        entryDiv.appendChild(sccsSelect)
    });
}
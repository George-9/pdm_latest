import { CREATE_ELEMENT, GEL_INPUT_EL_VALUE_BY_ID, GET_EL_BY_ID } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";

let showingAddGroupDiv = false;

async function GetGroups() {
    return await (await NetTool.POST_CLIENT('/get/parish/groups',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify({
            parish_id: LocalStorageContract.STORED_PARISH_ID()
        })
    )).json()
}

document.addEventListener('DOMContentLoaded', (ev) => {
    const groupsDiv = GET_EL_BY_ID('groups-div');
    const addGroupButton = GET_EL_BY_ID('add-parish-group');
    const addGoupDiv = GET_EL_BY_ID('add-group');

    addGroupButton.onclick = (ev) => {
        if (showingAddGroupDiv) {
            addGoupDiv.style.display = 'none';
            addGoupDiv.style.height = '0px';
            addGroupButton.src = "../../resources/icons/add_icon.png"
            showingAddGroupDiv = false;
        } else {
            addGoupDiv.style.display = 'flex';
            addGoupDiv.style.height = 'fit-content';
            addGoupDiv.style.flexdirection = 'column';
            addGroupButton.src = "../../resources/icons/close_black.png"
            showingAddGroupDiv = true;
        }
    }

    GET_EL_BY_ID('save-group').onclick = async (ev) => {
        const groupName = GEL_INPUT_EL_VALUE_BY_ID('group-name');
        const minAge = GEL_INPUT_EL_VALUE_BY_ID('group-min-age');
        const maxAge = GEL_INPUT_EL_VALUE_BY_ID('group-max-age');

        if (!groupName || !minAge || !maxAge) {
            return MessegePopup.ShowMessegePuppy('Some details are missing, check and try again')
        }

        if (IS_NULL_OR_EMPTY(groupName)) {
            return MessegePopup.ShowMessegePuppy('operation canceled');
        }

        const result = await NetTool.POST_CLIENT('/add/parish/group',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                'parish_id': LocalStorageContract.STORED_PARISH_ID(),
                name: groupName,
                min_age: minAge,
                max_age: maxAge
            }))

        MessegePopup.ShowMessegePuppy(`${(await result.json()).response}`)
    }

    GetGroups().then(parishGroups => {
        console.log(parishGroups);
        if (!parishGroups || !parishGroups.length || parishGroups.length < 1) {
            groupsDiv.style.fontSize = '20px';
            groupsDiv.style.fontSize = '100';
            groupsDiv.innerText = 'parish has no registered groups yet'
        } else {
            for (let i = 0; i < parishGroups.length; i++) {
                const groupData = parishGroups[i];
                groupsDiv.append(createAgeTable(groupData));
            }
        }
    })
})

// function GroupView(groupData) {
//     const div = CREATE_ELEMENT('div');

//     const groupName = CREATE_ELEMENT('input');
//     groupName.value = groupData['name']

//     const agesRow = CREATE_ELEMENT('div');
//     agesRow.classList.add('flex-column', 'full-width', 'justify-space-between');

//     const groupMinAge = CREATE_ELEMENT('p');
//     groupMinAge.innerText = groupData['min_age']
//     const minTitle = CREATE_ELEMENT('p')
//     minTitle.innerText = 'min age:'

//     const groupMaxAge = CREATE_ELEMENT('p');
//     groupMaxAge.innerText = groupData['max_age']

//     const maxTitle = CREATE_ELEMENT('p')
//     maxTitle.innerText = 'max age:';

//     agesRow.append(minTitle, groupMinAge, CREATE_ELEMENT('br'), maxTitle, groupMaxAge)

//     div.append(groupName, agesRow)

//     return div;
// }

function createAgeTable(groupDetails) {
    // Create the parent div
    const parentDiv = document.createElement('div');
    parentDiv.classList.add('flex-column', 'align-center', 'justify-center')
    // parentDiv.style.border = 'solid 1px grey';
    parentDiv.style.padding = '5px';
    // parentDiv.style.backgroundColor = '';
    parentDiv.style.margin = '5px';

    const actionsRow = CREATE_ELEMENT('div');
    actionsRow.classList.add('flex-row', 'align-center', 'justify-end')

    const viewLeadersButton = CREATE_ELEMENT('button');
    viewLeadersButton.innerText = 'Leaders';
    viewLeadersButton.classList.add('reg-btn');

    const viewMembersButton = CREATE_ELEMENT('button');
    viewMembersButton.innerText = 'Members';
    viewMembersButton.classList.add('reg-btn');

    viewMembersButton.onclick = async (ev) => {
        ev.preventDefault();
        console.log(groupDetails);

        if (!groupDetails['min_age'] || !groupDetails['max_age']) {
            return;
        }

        const membersRange = await (await NetTool.POST_CLIENT('/parish/search/group/members/by/age',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                'parish_id': LocalStorageContract.STORED_PARISH_ID(),
                'min_age': groupDetails['min_age'],
                'max_age': groupDetails['max_age']
            })
        )).json()

        console.log(membersRange);
    }

    actionsRow.append(viewLeadersButton, viewMembersButton);

    // Create the table element
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.color = '#5b5b5b';
    table.style.backgroundColor = 'rgb(255 188 182)';
    table.style.width = '50%';
    table.style.margin = '20px 0';

    // Create the table heading
    const heading = document.createElement('caption');
    heading.textContent = `${groupDetails.name}`;
    heading.style.fontSize = '20px';
    heading.style.color = 'grey';
    heading.style.textAlign = 'start';
    heading.style.fontWeight = 'bold';
    heading.style.marginBottom = '10px';
    table.appendChild(heading);

    // Function to add a row to the table
    function addRow(key, value) {
        const row = document.createElement('tr');

        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        keyCell.style.border = '1px solid black';
        keyCell.style.padding = '8px';
        keyCell.style.fontWeight = 'bold';
        row.appendChild(keyCell);

        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        valueCell.style.border = '1px solid black';
        valueCell.style.padding = '8px';
        row.appendChild(valueCell);

        table.appendChild(row);
    }

    // Add rows for min_age and max_age
    addRow('min age', groupDetails.min_age);
    addRow('max age', groupDetails.max_age);

    // Append the table to the parent div
    parentDiv.append(table, actionsRow);

    // Return the parent div
    return parentDiv;
}



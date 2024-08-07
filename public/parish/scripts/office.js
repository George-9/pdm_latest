import { GET_EL_BY_ID } from "../../tools/dom.js"
import { NetTool } from "../../tools/netTool.js"
import { LocalStorageContract } from "../../tools/storage.js"

document.addEventListener('DOMContentLoaded', async (ev) => {
    const leaders = await (await NetTool.POST_CLIENT('/get/parish/leaders',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify({
            parish_id: LocalStorageContract.STORED_PARISH_ID()
        }))
    ).json()

    if (!leaders || !leaders.length || leaders.length < 0) {
        GET_EL_BY_ID('leaders-div').innerText = 'no added leaders yet';
    } else {
        const tableBody = document.getElementById('leaders-table').getElementsByTagName('tbody')[0];
        tableBody.style.border = 'solid 1px grey';

        // Iterate over the data array and append each leader to the table
        leaders.forEach(leader => {
            const row = document.createElement('tr');
            row.style.border = 'solid 1px grey';

            const nameCell = document.createElement('td');
            nameCell.style.width = '50%';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameCell.style.border = 'solid 1px grey';
            nameInput.value = leader.name;
            nameInput.style.border = 'none';
            nameInput.style.width = '80%';
            nameCell.appendChild(nameInput);
            row.appendChild(nameCell);

            const positionCell = document.createElement('td');
            positionCell.style.border = 'solid 1px grey';
            positionCell.textContent = leader.position;
            row.appendChild(positionCell);

            tableBody.appendChild(row);
        })
    }
})
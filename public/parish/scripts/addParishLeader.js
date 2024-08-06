import { GET_EL_BY_ID } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";

document.getElementById('add-icon').addEventListener('click', function () {
    const addLeaderCard = document.getElementById('add-leader-card');
    if (addLeaderCard.style.display === 'none' || addLeaderCard.style.display === '') {
        addLeaderCard.style.display = 'block';
        document.getElementById('add-icon').innerText = 'Close'
        GET_EL_BY_ID('main-div').style.display = 'none'
    } else {
        addLeaderCard.style.display = 'none';
        document.getElementById('add-icon').innerText = 'Add Leader'
        GET_EL_BY_ID('main-div').style.display = 'block'
    }
});

document.getElementById('submit-leader').addEventListener('click', async function () {
    const leaderName = document.getElementById('leader-name').value;
    const leaderPosition = document.getElementById('leader-position').value;

    if (leaderName && leaderPosition) {
        const table = document.getElementById('leaders-table').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();

        const nameCell = newRow.insertCell(0);
        const positionCell = newRow.insertCell(1);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = leaderName;
        nameInput.style.border = 'none';
        nameInput.style.width = '100%';

        const uploadedResult = await (await NetTool.POST_CLIENT('/add/parish/leader',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                parish_id: LocalStorageContract.STORED_PARISH_ID(),
                'name': leaderName,
                'position': leaderPosition
            })
        )).json()

        if (uploadedResult === 'success') {

            nameCell.appendChild(nameInput);
            positionCell.textContent = leaderPosition;

            // Clear the input fields
            document.getElementById('leader-name').value = '';
            document.getElementById('leader-position').value = '';

            // Hide the add leader card
            document.getElementById('add-leader-card').style.display = 'none';
        } else {
            MessegePopup.ShowMessegePuppy(uploadedResult);
            console.log(uploadedResult);
        }
    } else {
        alert('Please fill in both fields.');
    }
});
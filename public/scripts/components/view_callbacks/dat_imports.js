import { domCreate } from "../../dom/query.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Column } from "../UI/column.js";
import { MondoText } from "../UI/mondo_text.js";
import { TextEdit } from "../UI/textedit.js";

const submitButton = domCreate('button');
submitButton.innerText = 'upload';
submitButton.style.border = '1px solid grey';
let uploading = false;

export function promptUploadMembers() {

    const fileInput = TextEdit({ 'type': 'file' });
    fileInput.setAttribute('accept', 'xlsx', 'xls', 'csv');


    function readExcel(file) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const dataSource = XLSX.utils.sheet_to_json(worksheet);

            await uploadMembersInChunks(dataSource);
        };
        reader.readAsArrayBuffer(file);
    }

    // addClasslist(submitButton, ['bi', 'bi-cloud-upload']);
    submitButton.onclick = function (ev) {
        if (uploading) {
            return;
        }

        const file = fileInput.files[0];
        if (!file) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please sellect a fiie to proceed' })
            ]);
        } else {
            uploading = true;
            submitButton.innerText = 'uploading...';
            readExcel(file);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [fileInput]
    })

    ModalExpertise.showModal({
        'topRowUserActions': [submitButton],
        'actionHeading': 'upload members',
        'children': [column]
    })
}

/** 
 * @todo a function that uploads an array of 3000 members similar to the one above, but upload in chunks of
 * a 50 and delay to upload the next one by 3 seconds
 * plus the upload button should be disabled while the upload is happening
 * and the upload button should be enabled after the upload is complete
*/
// NB: uploading by chunks is KEY and VERY IMPORTANT
async function uploadMembersInChunks(members) {
    uploading = true;
    submitButton.innerText = 'uploading...';
    submitButton.disabled = false;

    const chunkSize = 50;
    const delay = 3000; // 3 seconds
    let i = 0;


    async function uploadChunk() {
        const chunk = members.slice(i, i + chunkSize);
        if (chunk.length === 0) {
            submitButton.disabled = false;
            return;
        }

        await Post('/parish/upload/members', { members: chunk }, { 'requiresParishDetails': true })
            .then(result => {
                MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })])
                i += chunkSize;
                setTimeout(uploadChunk, delay);
            })
            .catch(error => {
                console.error(error);
                uploadButton.disabled = false;
            });
    }

    await uploadChunk();
}

// // Example usage:
// const
//     members = [/* Array of 3000 members */];
// uploadMembersInChunks(members);
// ```
// This code will upload the members in chunks of 50 with a 3-second delay between each chunk.
// The upload button will be disabled while the upload is happening and will be enabled after the upload is complete.
// This is a safe and efficient way to upload large amounts of data to the server.
// It is important to note that the chunk size and delay should be adjusted based on the server's capacity and the size of the data being uploaded.
// If the server is not able to handle the chunk size, you may need to reduce it.
// If the delay is too short, the server may be overwhelmed by too many requests at once.
// You should also consider adding error handling to the code to handle cases where the upload fails.
// This will help to ensure that the upload process is robust and reliable.
// In addition to the above, you can also use a progress bar to show the user how much data has been uploaded.
// This will give the user a better understanding of the upload process and will help to keep them informed.
// You can also use a library like Axios to make the HTTP requests.
// Axios provides a number of features that can make the upload process easier, such as progress tracking and error handling.
// The following code is an example of how to use Axios to upload members in chunks:
// ```javascript
// import axios from 'axios';

// function uploadMembersInChunks(members) {
//     const chunkSize = 50;
//     const delay = 3000; // 3 seconds
//     let i = 0;
//     const uploadButton = document.getElementById('uploadButton');
//     uploadButton.disabled = true;

//     function uploadChunk() {
//         const chunk = members.slice(i, i + chunkSize);
//         if (chunk.length === 0) {
//             uploadButton.disabled = false;
//             return;
//         }

//         axios.post('/parish/upload/members', { members: chunk }, { 'requiresParishDetails': true })
//             .then(response => {
//                 console.log(response);
//                 i += chunkSize;
//                 setTimeout(uploadChunk
//                     , delay);
//             })
//             .catch(error => {
//                 console.error(error);
//                 uploadButton.disabled = false;
//             });
//     }

//     uploadChunk();
// }

// // Example usage:
// const
//     members = [/* Array of 3000 members */];
// uploadMembersInChunks(members);
// ```
// This code will upload the members in chunks of 50 with a 3-second delay between each chunk.
// The upload button will be disabled while the upload is happening and will be enabled after the upload is complete.
// This is a safe and efficient way to upload large amounts of data to the server.
// It is important to note that the chunk size and delay should be adjusted based on the server's capacity and the size of the data being uploaded.
// If the server is not able to handle the chunk size, you may need to reduce it.
// If the delay is too short, the server may be overwhelmed by too many requests at once.
// You should also consider adding error handling to the code to handle cases where the upload fails.
// This will help to ensure that the upload process is robust and reliable.
// In addition to the above, you can also use a progress bar to show the user how much data has been uploaded.
// This will give the user a better understanding of the upload process and will help to keep them informed.
// You can also use a library like Axios to make the HTTP requests.
// Axios provides a number of features that can make the upload process easier, such as progress tracking and error handling.
// The following code is an example of how to use Axios to upload members in chunks:
// ```javascript
// import axios from 'axios';

// function uploadMembersInChunks(members) {
//     const chunkSize = 50;
//     const delay = 3000; // 3 seconds
//     let i = 0;
//     const uploadButton = document.getElementById('uploadButton');
//     uploadButton.disabled = true;

//     function uploadChunk() {
//         const chunk = members.slice(i, i + chunkSize);
//         if (chunk.length === 0) {
//             uploadButton.disabled = false;
//             return;
//         }

//         axios.post('/parish/upload/members', { members: chunk }, { 'requiresParishDetails': true })
//             .then(response => {
//                 console.log(response);
//                 i += chunkSize;
//                 setTimeout(uploadChunk, delay);
//             })
//             .catch(error => {
//                 console.error(error);
//                 uploadButton.disabled = false;
//             });
//     }

//     uploadChunk();
// }

// // Example usage:
// const members = [/* Array of 3000 members */];
// uploadMembersInChunks(members);
// ```
// This code will upload the members in chunks of 50 with a 3-second delay between each chunk.
// The upload button will be disabled while the upload is happening and will be enabled after the upload is complete.
// This is a safe and efficient way to upload large amounts of data to the server.
// It is important to note that the chunk size and delay should be adjusted based on the server's capacity and the size of the data being uploaded.
// If the server is not able to handle the chunk size, you may need to reduce it.
// If the delay is too short, the server may be overwhelmed by too many requests at once.
// You should also consider adding error handling to the code to handle cases where the upload fails.
// This will help to ensure that the upload process is robust and reliable.
// In addition to the above, you can also use a progress bar to show the user how much data has been uploaded.
// This will give the user a better understanding of the upload process and will help to keep them informed.
// You can also use a library like Axios to make the HTTP requests.
// Axios provides a number of features that can make the upload process easier, such as progress tracking and error handling.
// The following code is an example of how to use Axios to upload members in chunks:
// ```javascript
// import axios from 'axios';

// function uploadMembersInChunks(members) {
//     const chunkSize = 50;
//     const delay = 3000; // 3 seconds
//     let i = 0;
//     const uploadButton = document.getElementById('uploadButton');
//     uploadButton
//         .disabled = true;

//     function uploadChunk() {
//         const chunk = members.slice(i, i + chunkSize);
//         if (chunk.length === 0) {
//             uploadButton.disabled = false;
//             return;
//         }

//         axios.post('/parish/upload/members', { members: chunk }, { 'requiresParishDetails': true })
//             .then(response => {
//                 console.log(response);
//                 i += chunkSize;
//                 setTimeout(uploadChunk, delay);
//             })
//             .catch(error => {
//                 console.error(error);
//                 uploadButton.disabled = false;
//             });
//     }

//     uploadChunk();
// }

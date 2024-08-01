const { GET_EL_BY_ID, QUERY_FIRST_EL } = require("../../tools/dom");
const { SimplifiedNavigator } = require("../../tools/navigator");
const { LocalStorageContract } = require("../../tools/storage");

window.onload = Validate

function Validate() {
    if (!LocalStorageContract.STORAGE_IS_EMPTY()) {
        SimplifiedNavigator.NavigateByReplacement('pdm.html');
    } else {
        document.body.removeChild(GET_EL_BY_ID("loadingIndicator"));
        GET_EL_BY_ID("centerView").style.opacity = 1;
    }
}
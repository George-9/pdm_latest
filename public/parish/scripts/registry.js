import { GET_EL_BY_ID } from "../../tools/dom.js";
import { RegisterMember } from "./registerMemberAction.js";

document.addEventListener('DOMContentLoaded', (ev) => {
    ev.preventDefault();

    GET_EL_BY_ID('register-member').onclick = RegisterMember
})
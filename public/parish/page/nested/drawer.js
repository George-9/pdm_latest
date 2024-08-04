import { GET_EL_BY_ID, QUERY_FIRST_EL } from "../../../tools/dom.js";


export class DrawerManger {
    static isDrawerShowing = false;

    static get Drawer() {
        return DrawerManger.#drawer()
    }

    static #drawer() {
        return QUERY_FIRST_EL('.drawer');
    }

    static ToggleDrawer() {
        if (!DrawerManger.#drawer()) {
            return;
        }

        if (DrawerManger.isDrawerShowing) {
            DrawerManger.#HideDrawer()

        } else {
            DrawerManger.#ShowDrawer();
        }

    }

    static #ShowDrawer() {
        let d = DrawerManger.#drawer()
        if (!d) {
            return;
        }

        d.style.width = '80%'
        d.style.padding = '8px'
        d.style.display = 'flex'
        d.classList.add('flex-column')

        DrawerManger.isDrawerShowing = true;
    }

    static #HideDrawer() {
        let d = DrawerManger.#drawer()
        if (!d) {
            return;
        }

        d.style.width = '0%'
        d.style.padding = '0px'
        d.style.display = 'none'
        d.classList.remove('flex-column')

        DrawerManger.isDrawerShowing = false;
    }
}


function Main() {
    let toggler = GET_EL_BY_ID('drawer-toggle');
    if (toggler) {
        toggler.onclick = () => {
            if (DrawerManger.isDrawerShowing) {
                toggler.src = '../../../resources/icons/menu_black.png'
            }
            else {
                toggler.src = '../../../resources/icons/close_black.png'
            }
            DrawerManger.ToggleDrawer()
        }

    }

}

Main()

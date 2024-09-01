import { Column } from "./components/UI/column.js";
import { MondoBigH3Text, MondoText } from "./components/UI/mondo_text.js";
import { Row } from "./components/UI/row.js";
import { addClasslist, StyleView } from "./components/utils/stylus.js";
import { domCreate, domQueryAll } from "./dom/query.js";

export class DrawerMenu {
    heading = '';
    subMenus = [];
    groupClass = '';
    isShowingMenus = false;

    /**
     * A group of menus with related actions
     * 
     * @param {string} heading the heading of this menu category
     * @param {Menu []} subMenus a list of submenus in this group
     */
    constructor(heading = '', groupClass, subMenus, isShowingMenus) {
        this.heading = heading;
        this.groupClass = groupClass;
        this.subMenus = subMenus;
        this.isShowingMenus = isShowingMenus;
    }
}

export class Menu {
    text;
    icon;
    /**
     * callback for when this menu is clicked
     */
    action;
    groupClass;

    constructor(text, icon, groupClass, action) {
        this.text = text;
        this.icon = icon;
        this.action = action;
        this.groupClass = groupClass;
    }

    get view() {
        const anchor = domCreate('a');
        addClasslist(anchor, ['cursor-pointer']);

        const text = MondoText({ 'text': this.text });
        const icon = domCreate('i');
        addClasslist(icon, ['bi', this.icon]);

        const row = Row({ 'children': [icon, text], classlist: ['a-c', 'just-start', 'm-margin-top'] });
        row.style.width = '80%'
        anchor.appendChild(row);
        anchor.onclick = this.action;

        anchor.classList.add(this.groupClass);
        return anchor;
    }
}

/**
 * populates the drawer with views
 * 
 * @param {HTMLElement | Node} drawer the drawer to populate
 * @param {DrawerMenu[]} drawerMenus array to populate the drawer
 */
export function populateDrawer(drawer, drawerMenus) {
    for (let i = 0; i < drawerMenus.length; i++) {
        const drawerMainMenu = drawerMenus[i];
        const menusCategoryTitle = Row({
            'classlist': ['m-pad'],
            'children': [
                MondoBigH3Text({
                    'text': drawerMainMenu.heading,
                    'styles': [{ 'color': 'white', 'font-weight': '900' }],
                })
            ],
        });

        addClasslist(menusCategoryTitle, ['c-p']);

        const column = Column({ 'children': [menusCategoryTitle] });

        menusCategoryTitle.onclick = function (ev) {
            ev.preventDefault();
            const subMenus = domQueryAll(`.${drawerMainMenu.groupClass}`);

            if (drawerMainMenu.isShowingMenus) {
                subMenus.forEach(function (m) { m.classList.add('disp-none'); });
                drawerMainMenu.isShowingMenus = false;
            } else {
                subMenus.forEach(function (m) { m.classList.remove('disp-none'); });
                drawerMainMenu.isShowingMenus = true;
            }
        };


        for (let j = 0; j < drawerMainMenu.subMenus.length; j++) {
            const subMenu = drawerMainMenu.subMenus[j];
            column.appendChild(subMenu.view);
        }

        let logOut = MondoText({ 'text': 'Log Out' });
        StyleView(logOut, [{ 'position': 'fixed' }, { 'bottom': '0px' }, { 'padding': '10px' }])

        logOut.onclick = LogOut;

        column.appendChild(logOut);
        drawer.appendChild(column);
    }
}


function LogOut() {
    localStorage.clear();
    window.location.reload()
}
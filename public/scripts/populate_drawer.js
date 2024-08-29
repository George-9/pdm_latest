import { Column } from "./components/UI/column.js";
import { MondoBigH3Text, MondoText } from "./components/UI/mondo_text.js";
import { Row } from "./components/UI/row.js";
import { addClasslist } from "./components/utils/stylus.js";
import { domCreate, domQuery, domQueryById } from "./dom/query.js";
import { work } from "./dom/worker.js";

export default { 'populateDrawer': work(Main) }

class DrawerMenu {
    heading = '';
    subMenus = [];

    /**
     * A group of menus with related actions
     * 
     * @param {string} heading the heading of this menu category
     * @param {Menu[]} subMenus a list of submenus in this group
     */
    constructor(heading = '', subMenus) {
        this.heading = heading;
        this.subMenus = subMenus;
    }
}

class Menu {
    text;
    icon;
    /**
     * callback for when this menu is clicked
     */
    action;

    constructor(text, icon, action) {
        this.text = text;
        this.icon = icon;
        this.action = action;
    }

    getView() {
        const anchor = domCreate('a');
        addClasslist(anchor, ['cursor-pointer']);

        const text = MondoText({ 'text': this.text });
        const icon = domCreate('i');
        addClasslist(icon, ['bi', this.icon]);

        const row = Row({ 'children': [icon, text], classlist: ['a-c', 'just-start', 'm-margin-top'] });
        row.style.width = '80%'
        anchor.appendChild(row);
        anchor.onclick = this.action;

        return anchor;
    }
}

function Main() {
    const drawer = domQuery('.drawer-container');
    const drawerMenus = [
        new DrawerMenu('miscellenious', [
            new Menu('members', 'bi-people', () => alert('...')),
            new Menu('groups', 'bi-opencollective'),
        ])
    ]

    populateDrawer(drawer, drawerMenus);
}


/**
 * populates the drawer with views
 * 
 * @param {HTMLElement | Node} drawer the drawer to populate
 * @param {DrawerMenu[]} drawerMenus array to populate the drawer
 */
function populateDrawer(drawer, drawerMenus) {
    for (let i = 0; i < drawerMenus.length; i++) {
        const drawerMainMenu = drawerMenus[i];
        const menusCategoryTitle = MondoBigH3Text({
            'text': drawerMainMenu.heading,
            'styles': [{ 'color': 'white', 'font-weight': '900' }]
        });
        const column = Column({ 'children': [menusCategoryTitle] });

        for (let j = 0; j < drawerMainMenu.subMenus.length; j++) {
            const subMenu = drawerMainMenu.subMenus[j];
            column.appendChild(subMenu.getView());
        }
        drawer.appendChild(column);
    }
}
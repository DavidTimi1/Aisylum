const THEMES = ["light", "dark"];

export function ThemeClient(){
    initTheme();
    return null;
}

function getTheme() {
    let pref = localStorage.getItem("theme");
    if (!pref) {
        let prefLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        pref = prefLight ? "light" : "dark"
    }
    return pref;
}


function initTheme(){
    const theme = getTheme();

    const root = document.querySelector(":root");
    const colorScheme = ensureColorScheme();

    colorScheme.setAttribute('content', theme);
    root.classList.add(theme);
}


export function changeTheme(){
    const theme = getTheme();
    const newTheme = THEMES[THEMES.indexOf(theme) ? 0 : 1];

    const root = document.querySelector(":root");
    const colorScheme = ensureColorScheme();

    colorScheme.setAttribute('content', newTheme);
    root.classList.remove(theme);
    root.classList.add(newTheme);

    try {
        localStorage.setItem("theme", newTheme)
    } catch (err) {
        console.error(err)
    }

    return newTheme
}

function ensureColorScheme(){
    let getColorScheme = () => document.head.querySelector("meta[name='color-scheme']");
    if (!getColorScheme()){
        document.head.insertAdjacentHTML('beforeend', 
            "<meta name='color-scheme'></meta>"
        )
    }

    return getColorScheme()
}
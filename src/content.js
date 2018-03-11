import { Background } from './background.js';
import './assets/scss/content.scss';

function displayUserContent(repositories) {
    const container = document.createElement('div');
    container.setAttribute('id', 'oauth2-container');
    container.textContent = `Hello, Github extension currently loaded ${repositories.length} repositories`;
    document.querySelector('body').appendChild(container);
}

document.addEventListener('DOMContentLoaded', () => {
    const background = new Background();
    background.getAllRepositories().then((repositories) => {
        displayUserContent(repositories.items);
    });
});
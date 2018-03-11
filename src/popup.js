import './assets/scss/style.scss';
import { Background } from './background.js';
import { GithubAuthorizeProvider } from './githubAuthorize.js';

class Popup {
    constructor() {
        this._background = new Background();
        this._githubAuthorizeProvider = new GithubAuthorizeProvider({
          clientId: 'd552e7f73440013d1e32',
          clientSecret: 'c1972f67e3de10302aa732e17dca4f0f8ab5c560',
          scope: 'user repo'
        });

        this.prepareSearchRepositories();
    }

    prepareSearchRepositories() {
        const searchRepositoriesContainer = document.querySelector('#searchRepositoriesContainer');
        const searchRepositoriesTable = searchRepositoriesContainer.querySelector('table');
        const starsSortIcon = searchRepositoriesTable.querySelector('i.starsSort');
        const updatedSortIcon = searchRepositoriesTable.querySelector('i.updatedSort');
        const forksSortIcon = searchRepositoriesTable.querySelector('i.forksSort');
        const repositoryNameInput = searchRepositoriesContainer.querySelector('input[name=\'repositoryName\']');
        const repositoryAuthorInput = searchRepositoriesContainer.querySelector('input[name=\'repositoryAuthor\']');
        const searchRepositoriesButton = searchRepositoriesContainer.querySelector('#searchRepositories');
        const backToListRepositories = searchRepositoriesContainer.querySelector('#backToListRepositories');
        
        const sort = {
            STARS: 'stars',
            FORKS: 'forks',
            UPDATED: 'updated',
        }

        const sortOrderAsc = 'asc';
        const sortOrderDesc = 'desc';
        const starsSortOrderAsc = true;
        const sortOrder = {
            starsDesc: true,
            updatedDesc: true,
            forksDesc: true,
        };
        const sortValues = {
            name: 'stars',
            order: sortOrderDesc
        };

        starsSortIcon.addEventListener('click', (event) => {
            sortOrder.starsDesc = !sortOrder.starsDesc;
            sortValues.name = 'stars';
            sortValues.order = sortOrder.starsDesc ? sortOrderDesc : sortOrderAsc;
            this.renderSearchRepositories(repositoryNameInput.value, repositoryAuthorInput.value, sortValues.name, sortValues.order);
        });

        updatedSortIcon.addEventListener('click', (event) => {
            sortOrder.updatedDesc = !sortOrder.updatedDesc;
            sortValues.name = 'updated';
            sortValues.order = sortOrder.updatedDesc ? sortOrderDesc : sortOrderAsc;
            this.renderSearchRepositories(repositoryNameInput.value, repositoryAuthorInput.value, sortValues.name, sortValues.order);
        });

        forksSortIcon.addEventListener('click', (event) => {
            sortOrder.forksDesc = !sortOrder.forksDesc;
            sortValues.name = 'forks';
            sortValues.order = sortOrder.forksDesc ? sortOrderDesc : sortOrderAsc;
            this.renderSearchRepositories(repositoryNameInput.value, repositoryAuthorInput.value, sortValues.name, sortValues.order);
        });

        searchRepositoriesButton.addEventListener('click', (event) => {
            this.renderSearchRepositories(repositoryNameInput.value, repositoryAuthorInput.value, sort.STARS, sortOrderDesc);
        });

        backToListRepositories.addEventListener('click', (event) => {
            this.backToListRepositories();
        });
    }

    renderAllRepositories() {
        return this._background.getAllRepositories()
        .then((repositories) => {
            const tableTBody = document.querySelector('#searchRepositoriesContainer > .listRepositories > table tbody');
            const repositoriesColumns = repositories.items.map((repository) => ({
                id: repository.id,
                name: repository.name,
                ownerName: repository.owner.login,
                stars: repository.watchers,
                issues: repository.open_issues,
                forks: repository.forks,
                updated: repository.pushed_at,
                eventObject: repository
            }));
            this._renderRepositories(tableTBody, repositoriesColumns);
        });
    }

    renderSelectedRepository(repositoryEvent, repositoryType) {
        const repositoriesContainer = document.querySelector('#searchRepositoriesContainer');
        const listRepositories = repositoriesContainer.querySelector('.listRepositories');
        const selectedRepository = repositoriesContainer.querySelector('.selectedRepository');
        listRepositories.classList.add('d-none');
        selectedRepository.classList.remove('d-none');
        const repoURL = selectedRepository.querySelector('.repoURL');
        repoURL.textContent = repositoryEvent.clone_url;
        repoURL.setAttribute('href', repositoryEvent.clone_url);
        selectedRepository.querySelector('.repoName').textContent = repositoryEvent.name;
        selectedRepository.querySelector('.repoUserName').textContent = repositoryEvent.owner.login;
        selectedRepository.querySelector('.repoStars').textContent = repositoryEvent.watchers;
        selectedRepository.querySelector('.repoIssues').textContent = repositoryEvent.open_issues;
        selectedRepository.querySelector('.repoForks').textContent = repositoryEvent.forks;
    }

    backToListRepositories() {
        const repositoriesContainer = document.querySelector('#searchRepositoriesContainer');
        const listRepositories = repositoriesContainer.querySelector('.listRepositories');
        const selectedRepository = repositoriesContainer.querySelector('.selectedRepository');
        listRepositories.classList.remove('d-none');
        selectedRepository.classList.add('d-none');
    }

    renderSearchRepositories(querySearch = '', author = '', sort = 'stars', order = 'desc') {
        return this._background.searchRepositories(querySearch, author, sort, order)
        .then((repositories) => {
            const tableTBody = document.querySelector('#searchRepositoriesContainer > .listRepositories > table tbody');
            const repositoriesColumns = repositories.items.map((repository) => ({
                id: repository.id,
                name: repository.name,
                ownerName: repository.owner.login,
                stars: repository.watchers,
                issues: repository.open_issues,
                forks: repository.forks,
                updated: repository.pushed_at,
                eventObject: repository
            }));
            this._renderRepositories(tableTBody, repositoriesColumns);
        });
    }

    renderMyRepositories() {
        return this._background.getMyRepositories()
        .then((myRepositories) => {
            const tableTBody = document.querySelector('#myRepositoriesContainer > table tbody');
            const repositoriesColumns = myRepositories.map((repository) => ({
                id: repository.id,
                name: repository.name,
                stars: repository.watchers,
                issues: repository.open_issues,
                forks: repository.forks,
                updated: repository.pushed_at
            }));
            this._renderRepositories(tableTBody, repositoriesColumns);
        });
    }

    renderMyAccount() {
        return this._background.getMyAccount()
        .then((user) => {
            document.querySelector('#userName').textContent = user.login;
        });
    }

    prepareAuthorization() {
        document.querySelector('#login').addEventListener('click', () => this._githubAuthorizeProvider.login().then(() => {
            this.checkAuthorized();
        }));
        document.querySelector('#logout').addEventListener('click', () => { 
            this._githubAuthorizeProvider.logout();
            this.checkAuthorized();
        });
        this.checkAuthorized();
    }

    checkAuthorized() {
        const button = document.querySelector('#login');
        if (this._githubAuthorizeProvider.isAuthorized()) {
            button.classList.add('authorized');
            document.querySelector('a[href=\'#myRepositoriesContainer\']').classList.remove('disabled');
            document.querySelector('#login').classList.add('d-none');
            document.querySelector('#logout').classList.remove('d-none');
            this.renderMyAccount();
            this.renderMyRepositories();
        } else {
            document.querySelector('#login').classList.remove('d-none');
            document.querySelector('#logout').classList.add('d-none');
            button.classList.remove('authorized');
            document.querySelector('a[href=\'#myRepositoriesContainer\']').classList.add('disabled');
            document.querySelector('#userName').textContent = 'Anonymous';
        }
    }

    _renderRepositories(target, repositories) {
        const tbody = document.createElement('tbody');
        repositories.forEach((repository) => {
            const tr = document.createElement('tr');
            Object.keys(repository).forEach((keyName) => {
                const td = document.createElement('td');
                td.innerHTML = repository[keyName];
                tr.appendChild(td);
            });
            if (repository.eventObject) {
                tr.addEventListener("click", () => this.renderSelectedRepository(repository.eventObject));
            }
            tbody.appendChild(tr);
        });
        target.replaceWith(tbody);
    }
}

document.addEventListener('DOMContentLoaded', event => {
    const popup = new Popup();
    popup.prepareAuthorization();
    popup.renderAllRepositories();
    // document.removeEventListener('DOMContentLoaded', event, false);
});





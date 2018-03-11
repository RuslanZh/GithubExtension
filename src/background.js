import { RepositoriesLocalStorage } from './repositoriesLocalStorage.js';
import { GithubOAuth2LocalStorage } from './githubOAuth2LocalStorage.js';

export class Background {
    constructor() {
        this._domainURL = 'https://api.github.com';
        this._repositoriesLocalStorage = new RepositoriesLocalStorage(3600);
        this._githubOAuth2LocalStorage = new GithubOAuth2LocalStorage();
    }

    getAllRepositories() {
        const repositories = this._repositoriesLocalStorage.loadRepositories();
        
        if(repositories) {
            return Promise.resolve(repositories);
        }

        return this._getRepositories().then((repositories) => {
            this._repositoriesLocalStorage.saveRepositories(repositories);
            return repositories;
        });
    }

    searchRepositories(querySearch = '', author = '', sort = 'stars', order = 'desc') {
        return this._getRepositories(querySearch, author, sort, order);
    }

    getMyRepositories() {
        const searchURL = `${this._domainURL}/user/repos`;
        const token = this._githubOAuth2LocalStorage.getAuthorizationToken();
        return fetch(searchURL, {
                headers: new Headers({
                    'Authorization': `token ${token.accessToken}`
                })
            })
            .then((response) => response.json())
            .catch(error => console.log(error));
    }

    getMyAccount() {
        const searchURL = `${this._domainURL}/user`;
        const token = this._githubOAuth2LocalStorage.getAuthorizationToken();
        return fetch(searchURL, {
                headers: new Headers({
                    'Authorization': `token ${token.accessToken}`
                })
            })
            .then((response) => response.json())
            .catch(error => console.log(error));
    }

    _getRepositories(querySearch = '', author = '', sort = 'stars', order = 'desc') {
        const searchURL = `${this._domainURL}/search/repositories`;
        let resultedSerachURL = `${searchURL}?q=is:public`;

        if(querySearch) {
            resultedSerachURL = `${resultedSerachURL}+${querySearch} in:name`; 
        }

        if(author) {
            resultedSerachURL = `${resultedSerachURL}+user:${author}`; 
        }

        resultedSerachURL = `${resultedSerachURL}&sort=${sort}&order=${order}`; 

        return fetch(resultedSerachURL)
            .then((response) => response.json())
            .catch(error => console.log(error));
    }
}
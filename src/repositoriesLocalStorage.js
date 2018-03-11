export class RepositoriesLocalStorage {
    constructor(expirationInSecond) {
        this._key = '_repositories';
        this._expirationInSecond = expirationInSecond;
    }

    loadRepositories() {
        try {
            const data = JSON.parse(localStorage.getItem(this._key));
            if (!data){
                return null;
            }

            return (new Date().getTime() < data.timestamp) 
                    ? data.repositories
                    : null;
        }
        catch(error) {
            return null;
        }
    }

    saveRepositories(repositories) {
        const expirationMS = this._expirationInSecond * 1000;
        const data = {
            repositories: repositories, 
            timestamp: new Date().getTime() + expirationMS
        }
        localStorage.setItem(this._key, JSON.stringify(data));
    }
}
    
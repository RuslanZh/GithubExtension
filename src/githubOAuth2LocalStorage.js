export class GithubOAuth2LocalStorage {
    constructor() {
        this._tokenKey = 'github_oauth2_token';
    }

    getAuthorizationToken() {
        try {
            const token = JSON.parse(localStorage.getItem(this._tokenKey));
            if (!token){
                return null;
            }

            return token;
        }
        catch(error) {
            return null;
        }
        
    }

    removeAuthorizationToken(token) {
        localStorage.removeItem(this._tokenKey);
    }

    saveAuthorizationToken(token) {
        localStorage.setItem(this._tokenKey, JSON.stringify(token));
    }
}
    
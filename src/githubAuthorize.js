import { GithubOAuth2LocalStorage } from './githubOAuth2LocalStorage.js';
import { GithubOAuth2Adapter } from './githubOAuth2Provider.js';

export class GithubAuthorizeProvider {
    constructor({ clientId, clientSecret, scope }) {
        const currentBrowser = (chrome) ? chrome : browser;
        this._githubOAuth2LocalStorage = new GithubOAuth2LocalStorage();
        this._githubOauth2Adapter = new GithubOAuth2Adapter({
          clientId: clientId,
          clientSecret: clientSecret,
          redirectUrl: currentBrowser.identity.getRedirectURL('provider_cb'),
          scope: scope
        });
    }


    isAuthorized() {
        return (this._githubOAuth2LocalStorage.getAuthorizationToken() !== null);
    }

    logout() {
        this._githubOAuth2LocalStorage.removeAuthorizationToken();
    }

    login() {
        function defer() {
            var deferred = {};
            var promise = new Promise(function(resolve, reject) {
                deferred.resolve = resolve;
                deferred.reject  = reject;
            });
            deferred.promise = promise;
            return deferred;
        }
        const deferred = defer();
        const token = this._githubOAuth2LocalStorage.getAuthorizationToken();
        if (token === null) {
            // There's no access token yet. Start the authorizationCode flow
            // Create a new tab with the OAuth 2.0 prompt
            const currentBrowser = (chrome) ? chrome : browser;
            var redirectUri = chrome.identity.getRedirectURL('provider_cb');
            var url = this._githubOauth2Adapter.getAuthorizationCodeURL();
            currentBrowser.identity.launchWebAuthFlow({
                url: this._githubOauth2Adapter.getAuthorizationCodeURL(),
                interactive: true,
            }, 
            (redirectUrl) => {
                if(!redirectUrl) {
                return;
                }
                const authorizationCode = this._githubOauth2Adapter.parseAuthorizationCode(redirectUrl);
                this._githubOauth2Adapter.getAccessAndRefreshTokens(authorizationCode).then((token) => {
                    this._githubOAuth2LocalStorage.saveAuthorizationToken(token);
                    deferred.resolve();
                });
            });
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }
}





  
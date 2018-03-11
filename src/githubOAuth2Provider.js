export class GithubOAuth2Adapter {
  constructor(config) {
    this.adapterName = 'github';
    this.clientId = config.clientId;
    this.scope = config.scope;
    this.clientSecret = config.clientSecret;
    this.redirectUrl = config.redirectUrl;
  }

  /**
   * @return {URL} URL to the page that returns the authorization code
   */
  getAuthorizationCodeURL() {
    return ('https://github.com/login/oauth/authorize?' +
      'client_id={{CLIENT_ID}}&' +
      'scope={{SCOPE}}&' +
      'redirect_uri={{REDIRECT_URI}}')
        .replace('{{CLIENT_ID}}', this.clientId)
        .replace('{{SCOPE}}', this.scope)
        .replace('{{REDIRECT_URI}}', this.redirectURL());
  }

  /**
   * @return {URL} URL to the page that we use to inject the content
   * script into
   */
  redirectURL() {
    return this.redirectUrl; 
    //'https://bpgbjiahjmnlgeodbkddklkfmaeehnpb.chromiumapp.org/provider_cb';
    //return 'https://github.com/robots.txt';
  }

  /**
   * @return {String} Authorization code for fetching the access token
   */
  parseAuthorizationCode(url) {
    var error = url.match(/[&\?]error=([^&]+)/);
    if (error) {
      throw 'Error getting authorization code: ' + error[1];
    }
    return url.match(/[&\?]code=([\w\/\-]+)/)[1];
  }

  /**
   * @return {URL} URL to the access token providing endpoint
   */
  accessTokenURL() {
    return 'https://github.com/login/oauth/access_token';
  }

  /**
   * @return {String} HTTP method to use to get access tokens
   */
  accessTokenMethod() {
    return 'POST';
  }

  /**
   * @return {Object} The payload to use when getting the access token
   */
  accessTokenParams(authorizationCode) {
    return {
      code: authorizationCode,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectURL(),
      grant_type: 'authorization_code'
    };
  }

  /**
   * @return {Object} Object containing accessToken {String},
   * refreshToken {String} and expiresIn {Int}
   */
  parseAccessToken(response) {
    return {
      accessToken: response.match(/access_token=([^&]*)/)[1],
      expiresIn: Number.MAX_VALUE
    };
  }

  isAccessTokenExpired(tokenData) {
    return (new Date().valueOf() - token.accessTokenDate) > token.expiresIn * 1000;
  }

  /**
   * Gets access and refresh (if provided by endpoint) tokens
   *
   * @param {String} authorizationCode Retrieved from the first step in the process
   * @return {Object} Object containing accessToken {String},
   */
  getAccessAndRefreshTokens(authorizationCode) {
      const formData = new FormData();
      const accessTokenParams = this.accessTokenParams(authorizationCode);

      for(let key in accessTokenParams) {
        formData.append(key, accessTokenParams[key]);
      }
      
      return fetch(this.accessTokenURL(), {
        method: this.accessTokenMethod(),
        headers: {},
        body: formData
      })
      .then((response) => {
        if (!response.ok) {
          throw('failed request');
        }
        return response.text();
      })
      .then((tokenDataText) => { 
        const tokenData = this.parseAccessToken(tokenDataText)
        return {
          accessTokenDate: new Date().valueOf(),
          accessToken: tokenData.accessToken,
          expiresIn: tokenData.expiresIn
        };
      })
      .catch((error) => {
        throw(error);
      });
  }
}

// This script serves as a bridge between the HTML and the module-based app.js
import * as appModule from './app.js';

// Expose functions globally
window.selectType = appModule.selectType;
window.login = appModule.login;
window.signup = appModule.signup; 
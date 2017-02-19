// Load the custom app ES6 modules

import UsersDataService from './services/UsersDataService';

import UsersList from './components/list/UsersList';
import UserDetails from './components/details/UserDetails';

// Define the Angular 'users' module

export default angular
  .module("users", ['ngMaterial'])

  .component(UsersList.name, UsersList.config)
  .component(UserDetails.name, UserDetails.config)

  .service("UsersDataService", UsersDataService);

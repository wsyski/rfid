import UserDetailsController from './UserDetailsController'

export default {
  name : 'userDetails',
  config : {
    bindings         : {  selected: '<' },
    template      : require('./UserDetails.html'),
    controller       : [ '$mdBottomSheet', '$log', UserDetailsController ]
  }
};
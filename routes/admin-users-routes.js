const express = require('express');
const { check } = require('express-validator');

const adminUsersControllers = require('../controllers/admin-users-controllers');

const router = express.Router();

router.get('/user', adminUsersControllers.getUsers);

router.get('/user/:uid', adminUsersControllers.getUserById);
// router.patch(
//     'user/update/:uid',
//     adminUsersControllers.updateUser
//   );
//   router.delete('/:uid', adminUsersControllers.deleteUser)



//   Pending
router.get('/pending', adminUsersControllers.getPendingUsers);

router.patch(
  '/pending/update/:pid',
  adminUsersControllers.addPendingUsers 
);

router.get('/pending/:pid', adminUsersControllers.getPendingUserById);
 


//   router.delete('pending/:uid', adminUsersControllers.deleteUser)

module.exports = router;

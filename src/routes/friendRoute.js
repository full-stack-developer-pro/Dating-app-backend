const friendController = require('../controllers/friendController');

const {checkUserAuth} = require("../middleware/auth")
const auth = require("../services/roleService")

module.exports = (app) =>{
    app.post('/api/addFriend/:userId',checkUserAuth, friendController.addFriend);
    app.post('/api/remove-friend/:userId',checkUserAuth, friendController.removeFriend);
}

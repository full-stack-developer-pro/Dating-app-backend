const userCtr = require('../controllers/listController')





module.exports = (app,validator) =>{
    app.get('/api/user/getList',userCtr.addList);

}


const path = require('path');

module.exports = {

    uploadDir: path.join(__dirname, '../public/uploads/'),

    isEmpty: function(obj){

        if(obj!=null){
            return false;
        }
        return true;
    }
}
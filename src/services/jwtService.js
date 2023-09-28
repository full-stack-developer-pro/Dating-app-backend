const jwt = require('jsonwebtoken');
const secret= "mohan@001"

module.exports.createJwt = async (user) => {
    try {
        const token = jwt.sign({ data: user },secret , { expiresIn: '5h' });
        return token;
    } catch (error) {
        console.log("Error", error);
        throw error;
    }
};

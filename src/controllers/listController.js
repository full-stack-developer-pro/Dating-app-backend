const userModel = require("../models/userModel");
const response = require('../db/dbRes');

module.exports.addList = async (req, res) => {
    try {
        let { gender, country, minValue, maxValue } = req.query;
        const filter = {};
        gender = gender ? gender.toLowerCase() : '';

        if (gender === 'female' || gender === 'male' || gender === 'all') {
            if (gender === 'female') {
                filter.gender = 'female';
            } else if (gender === 'male') {
                filter.gender = 'male';
            }
        } else {
            response.success = false;
            response.message = "Valid values for gender are 'male,' 'female,' or 'all'";
            response.data = null;
            return res.status(400).json(response);
        }

        if (country) {
            filter.country = country; 
        }

        if (minValue && !isNaN(minValue)) {
            filter.age = { $gte: parseInt(minValue) };
        }

        if (maxValue && !isNaN(maxValue)) {
            filter.age = { ...filter.age, $lte: parseInt(maxValue) };
        }

        const people = await userModel.find(filter);

        if (!people || people.length === 0) {
            if (!filter.gender && !filter.country && !filter.age) {
                response.success = false;
                response.message = "Both Female and Male Not Found";
            } else {
                const genderMessage = filter.gender ? `${filter.gender === 'female' ? 'Female' : 'Male'} Not Found` : '';
                const countryMessage = filter.country ? `Country '${filter.country}' Not Found` : '';
                const ageMessage = filter.age ? `Users with specified age range Not Found` : '';
                response.success = false;
                response.message = `${genderMessage}${genderMessage && countryMessage ? ' and ' : ''}${countryMessage}${(genderMessage || countryMessage) && ageMessage ? ' and ' : ''}${ageMessage}`;
            }
            response.data = null;
            res.status(404).json(response);
        } else {
            response.success = true;
            response.message = 'User List Get successfully';
            response.data = people;
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.success = false;
        response.message = 'Internal Server Error';
        response.data = null;
        res.status(500).json(response);
    }
}

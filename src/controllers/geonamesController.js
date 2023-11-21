const axios = require('axios');

exports.getCountryCities = async (req, res) => {
  const { countryCode } = req.params;

  try {
    const response = await axios.get(
      `http://api.geonames.org/searchJSON?country=${countryCode}&featureClass=P&maxRows=100&username=vicky123`
    );

    const citiesArray = response.data.geonames.map(city => ({ city: city.name }));

    res.json({ success: true, message: `Cities in ${countryCode}:`, data: citiesArray });
  } catch (error) {
    console.error('Error fetching cities:', error.message);
    res.json({ success: false, message: 'Error fetching cities', error: error.message });
  }
};


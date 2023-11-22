const axios = require('axios');

exports.getCountryCities = async (req, res) => {
  const { countryCode } = req.params;
  const username = 'ingenioushitech2580';

  try {
    const response = await axios.get(
      `http://api.geonames.org/searchJSON?country=${countryCode}&featureClass=P&username=${username}`
    );

    const citiesArray = response.data.geonames.map(city => ({
      city: city.name,
      lat: city.lat,
      lon: city.lng, 
      countryId: city.countryId,
      uniqueId: generateUniqueId(countryCode, city.name, city.lat, city.lng)
    }));

    res.json({ success: true, message: `Cities in ${countryCode}:`, data: citiesArray });
  } catch (error) {
    console.error('Error fetching cities:', error.message);
    res.json({ success: false, message: 'Error fetching cities', error: error.message });
  }
};
function generateUniqueId(countryCode, cityName, lat, lon) {
  return `${countryCode}_${cityName}_${lat}_${lon}`;
}

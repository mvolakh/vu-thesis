const express = require('express');

const SensorData = require('../db/models/SensorData')
const Room = require('../db/models/Room')

const router = express.Router();

router.get('/:id', async (req, res, next) => {
    // const sensorData = await SensorData.find();
    const latestDataByRoom = await Room.aggregate([
        {
            $match: {
                floor: parseInt(req.params.id),
            }
        },
        {
            $lookup: {
                from: 'sensordatas',
                localField: 'sensor',
                foreignField: 'sensor',
                as: 'sensorData'
            }
        },
        {
            $unwind:
            {
              path: '$sensorData',
              preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: {
                'sensorData.timestamp': -1,
                'sensorData.CO2_emission': 1
            }
        },
        {
            $group: {
                _id: '$_id',
                name: { $first: '$name' },
                floor: { $first: '$floor' },
                colorCode: { $first: '$colorCode' },
                x_coord: { $first: '$x_coord' },
                y_coord: { $first: '$y_coord' },
                width: { $first: '$width' },
                height: { $first: '$height' },
                latestSensorData: { $first: '$sensorData' }
            }
        },
        {
            $project: {
                _id: 0,
                name: 1,
                floor: 1,
                colorCode: 1,
                x_coord: 1,
                y_coord: 1,
                width: 1,
                height: 1,
                latestSensorData: { $ifNull: ["$latestSensorData", {}] }
            }
        },
        {
            $sort: {
                name: 1
            }
        }
    ]).exec();

    res.status(200).json(latestDataByRoom)
})

module.exports = router;
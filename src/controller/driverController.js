const  Driver = require('../models/Driver');
const  Delivery = require('../models/Delivery');

const  { object, string } = require('yup');
const  logger = require('../service/logger');

module.exports = {
    async create(req, res){
        const schema = object().shape({
            name: string().required('Name is required'),
        });

        try{
            await schema.validate(req.body, {abortEarly: false});

            const existingDriver = await Driver.findOne({
                where: {name: req.body.name}
            });

            if(existingDriver){
                logger.warn('Driver already registered.');
                return res.status(409).json({ error: 'Driver already registered.'});
            };

            const {name} = req.body;
            const newDriver = await Driver.create({name});

            logger.info('Sucessfull register driver');
            return res.status(201).json({newDriver});
        } catch(error){
            if(error.name === 'ValidationError'){
                const errors = error.inner.map(error => error.message);
                logger.warn(errors.join(', '));
                return res.status(400).json({errors});
            };

            logger.error('Error when saving data: ' + error.message);
            return res.status(500).json({ error: 'Internal server error.'});
        }
    },

    async getAll(req, res) {
        try {
            const drivers = await Driver.findAll({
                include: [
                    {
                        model: Delivery,
                        as: 'deliveries',
                        attributes: [], 
                        where: { status: 'Em andamento' },
                        required: false,
                    },
                ],
                where: {
                    '$deliveries.status$': null, 
                },
            });
    
            logger.info('Success in searching all Drivers');
            res.status(200).json({ drivers });
        } catch (err) {
            logger.error('Error in searching drivers: ' + err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
    
,    
    async getById(req, res){
        try{
            const id = req.params.id;
            const driver = await Driver.findByPk(id);

            if(!driver){
                logger.error('Error in seaching driver: ' + err.message);
                return res.status(404).json({ message: 'driver not found.'});
            };

            logger.info('Success in searching driver');
            res.status(200).json({driver});
        } catch(err){
            logger.error('Error in seaching driver: ' + err.message);
            return res.status(500).json({ error: 'Internal server error.'});
        };
    },
}
const Truck = require("../models/Truck");
const Delivery = require("../models/Delivery");
const { object, string } = require("yup");

module.exports = {
  async create(req, res) {
    const schema = object().shape({
      name: string().required("Name is required"),
      plate: string().required("Plate is required"),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const existingTruck = await Truck.findOne({
        where: { plate: req.body.plate },
      });

      if (existingTruck) {
        return res.status(409).json({ error: "Truck already registered." });
      }

      const { name, plate } = req.body;
      const newTruck = await Truck.create({ name, plate });

      return res.status(201).json({ newTruck });
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = error.inner.map((error) => error.message);
        return res.status(400).json({ errors });
      }

      return res.status(500).json({ error: "Internal server error." });
    }
  },

  async getAll(req, res) {
    try {
      const trucks = await Truck.findAll({
        include: [
          {
            model: Delivery,
            as: "deliveries",
            attributes: [],
            where: { status: "Em andamento" },
            required: false,
          },
        ],
        where: {
          "$deliveries.status$": null,
        },
      });
      res.status(200).json({ trucks });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error." });
    }
  },

  async getById(req, res) {
    try {
      const id = req.params.id;
      const truck = await Truck.findByPk(id);

      if (!truck) {
        return res.status(404).json({ message: "truck not found." });
      }

      res.status(200).json({ truck });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error." });
    }
  },

  async getTruckStats(req, res) {
    try {
      const totalValue = await Truck.count();

      const inRotation = await Delivery.count({
        where: { status: "Em andamento" },
        distinct: true,
        col: "truckId",
      });

      const available = totalValue - inRotation;

      res.status(200).json({
        totalValue,
        inRotation,
        available,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erro ao obter estatísticas dos caminhões",
          details: error.message,
        });
    }
  },
};

const Delivery = require("../models/Delivery");
const Truck = require("../models/Truck");
const Driver = require("../models/Driver");
const { object, string, number } = require("yup");
const { Op } = require("sequelize");

module.exports = {
  async create(req, res) {
    const schema = object().shape({
      destination: string().required("Destination is required"),
      type: string().required("Type is required"),
      value: number()
        .positive("Value must be positive")
        .required("Value is required"),
      truckId: number().required("Truck is required"),
      driverId: number().required("Driver is required"),
      status: string()
        .oneOf(["Em andamento", "Concluída"], "Invalid status")
        .required("Status is required"),
      date: string().required("date is required"),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const { destination, type, value, truckId, driverId, status, date } =
        req.body;

      const existingDelivery = await Delivery.findOne({
        where: {
          truckId,
          status: "Em andamento",
        },
      });

      if (existingDelivery) {
        return res
          .status(409)
          .json({ error: "Truck already has an associated ongoing delivery." });
      }

      const deliveriesThisMonth = await Delivery.count({
        where: {
          driverId,
          createdAt: {
            [Op.gt]: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
      });

      if (deliveriesThisMonth >= 2) {
        return res
          .status(409)
          .json({ error: "Driver already made two deliveries this month." });
      }

      const truckDeliveriesThisMonth = await Delivery.count({
        where: {
          truckId,
          createdAt: {
            [Op.gt]: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
      });

      if (truckDeliveriesThisMonth >= 4) {
        return res
          .status(409)
          .json({ error: "Truck already made four deliveries this month." });
      }

      const driverDeliveriesToNordeste = await Delivery.count({
        where: {
          driverId,
          destination: "Nordeste",
          createdAt: {
            [Op.gt]: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
      });

      if (destination === "Nordeste" && driverDeliveriesToNordeste >= 1) {
        return res.status(409).json({
          error: "Driver already made a delivery to Nordeste this month.",
        });
      }

      const regionalRates = {
        Nordeste: 0.2,
        Argentina: 0.4,
        Amazônia: 0.3,
      };
      const rate = value * (regionalRates[destination] || 0);

      const valuableIndicator = value > 30000;
      const haveInsurance = type === "Eletrônicos";
      const dangerous = type === "Combustível";

      const newDelivery = await Delivery.create({
        destination,
        type,
        value,
        status,
        valuableIndicator,
        haveInsurance,
        dangerous,
        rate,
        truckId,
        driverId,
        date,
      });

      return res.status(201).json({ newDelivery });
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = error.inner.map((e) => e.message);
        return res.status(400).json({ errors });
      }

      return res.status(500).json({ error: "Internal server error." });
    }
  },

  async getAll(req, res) {
    try {
      const deliveries = await Delivery.findAll({
        include: [
          {
            model: Truck,
            attributes: ["id", "name", "plate"],
          },
          {
            model: Driver,
            attributes: ["id", "name"],
          },
        ],
      });

      res.status(200).json(deliveries);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao obter entregas", details: error.message });
    }
  },

  async calculateDailyEarnings(req, res) {
    try {
      const deliveries = await Delivery.findAll({
        attributes: ["value", "rate", "status"],
      });
  
      const deliveriesStatus = await Delivery.findAll({
        where: {
          status: "Em andamento",
        },
        attributes: ["truckId", "status"],
      });

      const deliveriesStatusDrivers = await Delivery.findAll({
        where: {
          status: "Em andamento",
        },
        attributes: ["driverId", "status"],
      });
  
      const trucks = await Truck.findAll();
      const drivers = await Driver.findAll();
  
      const driversInProgress = new Set(
        deliveriesStatusDrivers.map((delivery) => delivery.driverId)
      );
      const availableDrivers = drivers.filter(
        (driver) => !driversInProgress.has(driver.id)
      );
  
      const totalByStatus = deliveries.reduce(
        (totals, delivery) => {
          const deliveryValue = delivery.value + (delivery.rate || 0);
  
          if (delivery.status === "Concluida") {
            totals.completed += deliveryValue;
          } else if (delivery.status === "Em andamento") {
            totals.inProgress += deliveryValue;
          }
  
          totals.all += deliveryValue;
  
          return totals;
        },
        { completed: 0, inProgress: 0, all: 0 }
      );
  
      return res.status(200).json({
        totalValue: totalByStatus.all,
        totalTrucks: trucks?.length,
        available: trucks?.length - deliveriesStatus?.length,
        inRotation: deliveriesStatus?.length,
        totalDrivers: drivers?.length,
        availableDrivers: availableDrivers?.length,
        inRotationDrivers: deliveriesStatus?.length,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao calcular os ganhos.",
        details: error.message,
      });
    }
  }
  ,
  async update(req, res) {
    const schema = object().shape({
      status: string().required("Status is required"),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const id = req.params.id;
      const { status, deliveryData } = req.body;

      const deliveryToAlter = await Delivery.findByPk(id);

      if (!deliveryToAlter) {
        return res
          .status(404)
          .json({ error: "Unable to update, delivery does not exist" });
      }

      if (status) deliveryToAlter.status = status;
      if (deliveryData) {
        if (deliveryData.destination !== undefined)
          deliveryToAlter.destination = deliveryData.destination;
        if (deliveryData.type !== undefined)
          deliveryToAlter.type = deliveryData.type;
        if (deliveryData.value !== undefined)
          deliveryToAlter.value = deliveryData.value;
        if (deliveryData.truckId !== undefined)
          deliveryToAlter.truckId = deliveryData.truckId;
        if (deliveryData.driverId !== undefined)
          deliveryToAlter.driverId = deliveryData.driverId;
        if (deliveryData.date !== undefined)
          deliveryToAlter.date = deliveryData.date;
        deliveryToAlter.deliveryData = deliveryData;
      }

      deliveryToAlter.updatedAt = new Date();

      await deliveryToAlter.save();

      return res.status(200).json(deliveryToAlter);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Internal server error." });
    }
  },
  async delete(req, res) {
    try {
      const { id } = req.params;

      const deliveryToDelete = await Delivery.findByPk(id);

      if (!deliveryToDelete) {
        return res.status(404).json({ error: "Delivery does not exist." });
      }

      await deliveryToDelete.destroy();

      return res
        .status(200)
        .json({ message: "Delivery successfully deleted." });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error." });
    }
  },
};

const { sequelize, Inventory } = require('../models'); // ✅ Added sequelize here

const createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      quantity,
      expirationDate,
      usage,
      prescriptionRequired,
      location,
      price
    } = req.body;

    const newItem = await Inventory.create({
      name,
      quantity,
      expirationDate,
      usage,
      prescriptionRequired,
      location,
      price,
      lastUpdated: new Date()
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Failed to create inventory item:', error);
    res.status(500).json({
      error: error.message || 'Failed to create inventory item'
    });
  }
};

const getAllItems = async (req, res) => {
  try {
    const items = await Inventory.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error('Failed to fetch inventory items:', error);
    res.status(500).json({ message: 'Failed to fetch inventory items', error });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching medicine by ID:', error);
    res.status(500).json({ error: 'Failed to fetch medicine by ID' });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      quantity,
      expirationDate,
      usage,
      prescriptionRequired,
      location,
      notes,
      price
    } = req.body;

    const [updated] = await Inventory.update(
      {
        name,
        quantity,
        expirationDate,
        usage,
        prescriptionRequired,
        location,
        notes,
        price,
        lastUpdated: new Date()
      },
      { where: { id } }
    );
    if (updated) {
      const updatedItem = await Inventory.findByPk(id);
      return res.status(200).json(updatedItem);
    }

    res.status(404).json({ message: 'Item not found' });
  } catch (error) {
    console.error('Failed to update item:', error);
    res.status(500).json({ message: 'Failed to update item', error });
  }
};

const checkInventoryForPrescription = async (req, res) => {
  const { medicines, doctorSignature } = req.body;

  try {
    const results = await Promise.all(
      medicines.map(async (med) => {

        // console.log('Checking medicine:', med.name);
        const normalizedName = med.name.trim().toLowerCase();

        // console.log('Normalized name:', normalizedName);

        const inventoryItem = await Inventory.findOne({
          where: sequelize.where(
            sequelize.fn('REPLACE', sequelize.fn('LOWER', sequelize.col('name')), ' ', ''),
            med.name.trim().toLowerCase().replace(/\s+/g, '')
          )
        });

        if (!inventoryItem) {
          return {
            ...med,
            available: false,
            reason: 'Not found in inventory'
          };
        }

        if (inventoryItem.quantity < med.quantity) {
          return {
            ...med,
            available: false,
            reason: `Only ${inventoryItem.quantity} in stock`
          };
        }

        if (inventoryItem.prescriptionRequired && !doctorSignature) {
          return {
            ...med,
            available: false,
            reason: 'Requires doctor signature'
          };
        }

        inventoryItem.quantity -= med.quantity;
          await inventoryItem.save();

        return {
          ...med,
          available: true,
          price: parseFloat(inventoryItem.price),
          reason: ''
        }

        const allAvailable = results.every((item) => item.available);

          if (allAvailable && prescriptionId) {
            await SimplePrescription.update(
              { status: 'Verified' },
              { where: { id: prescriptionId } }
         );
       }

        
      })
    );

    res.json({ medicines: results });
  } catch (err) {
    console.error('Error checking inventory:', err);
    res.status(500).json({ error: 'Server error while checking inventory' });
  }
};


module.exports = {
  createInventoryItem,
  getAllItems,
  getItemById,
  deleteInventoryItem,
  updateInventoryItem,
  checkInventoryForPrescription
};

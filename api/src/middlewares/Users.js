const {Sequelize} = require('sequelize');
const axios = require("axios");
const {Users} = require('../db.js')

export async function postUser(req, res) {
    const { name, lastName, phone, whatsapp, email, password, photo, active, role } = req.body;
    const newUser ={ name, lastName, phone, whatsapp, email, password, photo, active, role };
    try {
      if (
        !name ||
        !lastName ||
        !phone ||
        !whatsapp ||
        !email ||
        !password ||
        !role
      ) {
        return res.json({ error: "Incomplete information" });
      }
      
      await Users.create(newUser);
      res.status(200).json(newUser);
      return;
    } catch (error) {
      res.json(error);
      return;
    }
  }
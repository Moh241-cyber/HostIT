const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');
 
dotenv.config();
connectDB();
 
const addUser = async () => {
    try {
        const email = 'john.doe@example.com';
        const password = 'userpassword'; // Définir un mot de passe
 
        // Vérifiez si l'utilisateur existe déjà
        let user = await User.findOne({ email });
 
        if (user) {
            console.log(`User with email ${email} already exists. Deleting the user...`);
            await User.deleteOne({ email });
        }
 
        const hashedPassword = await bcrypt.hash(password, 10);
 
        user = new User({
            name: 'John Doe',
            email,
            password: hashedPassword,
            usedSpace: 0,
            quota: 1000000000, // 1GB
        });
 
        await user.save();
 
        const payload = {
            user: {
                id: user.id,
            },
        };
 
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Assurez-vous que c'est votre clé secrète JWT
            { expiresIn: '1h' }
        );
 
        console.log('User added successfully');
        console.log('Token:', token);
 
        mongoose.disconnect();
    } catch (err) {
        console.error(err.message);
        mongoose.disconnect();
    }
};
 
addUser();
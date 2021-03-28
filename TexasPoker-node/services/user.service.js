const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/database');
const User = db.User;



module.exports = {
    authenticate,
    getByUsername,
    addUser,
    getMoney,
    changeMoney,
    getUsernameById,
    deleteAccount,
};

async function authenticate({ username, password }) {

    const user = await User.findOne({username});
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({sub: user.id}, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getUsernameById(id)
{
    let user = await User.findOne({_id: id});
    return user ? user.username : "Invalid";
}

async function getByUsername(username) {
    return await User.find({username:username});
}

async function getMoney(username)
{
    let user = await User.findOne({username:username});
    return user ? user.money : -1;
}

async function changeMoney(username, money)
{
    let user = await User.findOne({username:username});
    if (!user) return;
    await User.updateOne({username:username},{money: user.money + money});
}

async function addUser(userParam) {

    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}


async function deleteAccount(username) {
    username = await getUsernameById(username);
    await User.deleteMany({username: username});
}


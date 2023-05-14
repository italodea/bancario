
const express = require('express');
const bodyParser = require('body-parser');

var db = require("./database/models.js");

const app = express();
app.use(bodyParser.json());



const port = 3000;

app.post('/account/create', async function (req, res) {
    if (!req.body.hasOwnProperty('id'))
        return res.status(400).json({ "error": true, "message": "Required parameter missing" });
    else {
        try {
            req.body.id += "";

            var id = req.body.id.replace("-", "");

            var row = await db.Accounts.findOne({
                where: {
                    account: id
                }
            });

            if (row == null) {
                await db.Accounts.create({
                    account: id,
                    balance: 0
                });

                var acc = {
                    "id": id,
                    "balance": 0
                }
                return res.json({ "error": false, "data": acc });
            } else {
                return res.status(400).json({ "error": true, "message": "Account already exists." });
            }
        } catch (error) {
            return res.status(503).json({ "error": true, "message": "Cannot query database"});
        }
    }
})


app.get('/account/balance/:id', async (req, res) => {

    // Check if the req has the parameter id
    if (!req.params.hasOwnProperty('id'))
        return res.status(400).json({ "error": true, "message": "Required parameter missing." });

    req.params.id += ""
    var id = req.params.id.replace('-', '')



    try {
        var row = await db.Accounts.findOne({
            where: {
                account: id
            }
        });

        if (row == null) {
            return res.status(404).json({ "error": true, "message": "Account not found." });
        }
        const acc = {
            "id": row.account,
            "balance": row.balance
        };
        return res.json({ "error": false, "data": acc });
    } catch (error) {
        return res.status(503).json({ "error": true, "message": "Cannot query database" });
    }
})

app.put('/account/credit/', async (req, res) => {
    if (!req.body.hasOwnProperty('id') || !req.body.hasOwnProperty('value'))
        return res.status(400).json({ "error": true, "message": "Required parameter missing." });

    req.body.id += ""

    var id = req.body.id.replace('-', '')
    var ammount = parseFloat(req.body.value)

    if (!(ammount && ammount > 0))
        return res.status(400).json({ "error": true, "message": "Required parameter invalid." });

    try {
        var row = await db.Accounts.update({
            balance: db.sequelize.literal('balance + ' + ammount)
        }, {
            where: {
                account: id
            },
        });

        var row = await db.Accounts.findOne({
            where: {
                account: id
            },
        });

        if (row == null) {
            return res.status(404).json({ "error": true, "message": "Account not found." });
        }
        const acc = {
            "id": row.account,
            "balance": row.balance
        };
        return res.json({ "error": false, "data": acc });
    } catch (error) {
        return res.status(503).json({ "error": true, "message": "Cannot query database"});
    }
})

app.put('/account/debit/', async (req, res) => {
    if (!req.body.hasOwnProperty('id') || !req.body.hasOwnProperty('value'))
        return res.status(400).json({ "error": true, "message": "Required parameter missing." });

    req.body.id += ""

    var id = req.body.id.replace('-', '')
    var ammount = parseFloat(req.body.value)

    if (!(ammount && ammount > 0))
        return res.status(400).json({ "error": true, "message": "Required parameter invalid." });

    try {
        var row = await db.Accounts.update({
            balance: db.sequelize.literal('balance - ' + ammount)
        },
            {
                where: {
                    account: id
                },
            });

        var row = await db.Accounts.findOne({
            where: {
                account: id
            },
        });

        if (row == null) {
            return res.status(404).json({ "error": true, "message": "Account not found." });
        }
        const acc = {
            "id": row.account,
            "balance": row.balance
        };
        return res.json({ "error": false, "data": acc });
    } catch (error) {
        return res.status(503).json({ "error": true, "message": "Cannot query database"});
    }
})

app.put('/account/transfer/', async (req, res) => {

    if (!req.body.hasOwnProperty('originId') || !req.body.hasOwnProperty('destinationId') || !req.body.hasOwnProperty('value'))
        return res.status(400).json({ "error": true, "message": "Required parameter missing." });

    req.body.originId += ""
    req.body.destinationId += ""

    var originId = req.body.originId.replace('-', '')
    var destinationId = req.body.destinationId.replace('-', '')
    var ammount = parseFloat(req.body.value)

    if (!(ammount && ammount > 0))
        return res.status(400).json({ "error": true, "message": "Required parameter invalid." });

    try {
        var originAccount = await db.Accounts.findOne({
            where: {
                account: originId
            },
        });

        if (originAccount == null) {
            return res.status(404).json({ "error": true, "message": "Origin Account not found." });
        }

        var destinationAccount = await db.Accounts.findOne({
            where: {
                account: destinationId
            },
        });

        if (destinationAccount == null) {
            return res.status(404).json({ "error": true, "message": "Destination Account not found." });
        }

        var row = await db.Accounts.update({
            balance: db.sequelize.literal('balance - ' + ammount)
        }, {
            where: {
                account: originId
            },
        });

        row = await db.Accounts.update({
            balance: db.sequelize.literal('balance + ' + ammount)
        }, {
            where: {
                account: destinationId
            },
        });




        const acc = [{
            "id": originAccount.account,
            "balance": originAccount.balance - ammount
        }];

        acc.push({
            "id": destinationAccount.account,
            "balance": destinationAccount.balance + ammount
        });

        row = await db.Accounts.findOne({
            where: {
                account: destinationId
            },
        });

        return res.json({ "error": false, "data": acc });
    } catch (error) {
        return res.status(503).json({ "error": true, "message": "Cannot query database"});
    }
})


// Default response for any other request
app.use(function (req, res) {
    return res.status(404);
});

app.listen(port, () => {
    console.log(`servidor iniciado na porta ${port}`);
})
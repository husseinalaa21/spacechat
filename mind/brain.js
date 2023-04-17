const dna = require('./dna')
const alian = require('./alian');

// .. DATA X 
const x = {}

// .. DATA RANDOM 
const xSingle = []
const xGroup = []

// .. ALIANS
const x_alians = []


// #BRAIN - CONNECTION
function socket(io) {
    io.on('connection', socket => {
        // THIS USER DATA
        const userdata = {
            "id": "",
            "socketId": "",
            "username": "",

            // SECURITY DATA
            "connected": false
        }

        // CHECK VAILD OF THE ID BEFORE ANY ACTION
        function idCheck(id) {
            if (id !== undefined && typeof id === "string" && id.length > 0 && id.length < 14) {
                if (id in x) {
                    return [true, id]
                } else {
                    return [false, id]
                }
            } else {
                return [false, "0x00000000"]
            }
        }

        // ADD NEW USER TO X DATA
        socket.on("dna", e => {
            // DOSE IS'T HAVE TEMPORARY DATA?
            if (userdata.connected === true) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            var username = e.username
            var password = e.password
            var pincode = Number(e.pincode)

            var new_dna = dna.id(username, password, pincode)
            if (new_dna.c === true) {
                // SET DATA
                userdata.id = new_dna.id
                userdata.username = new_dna.username
                userdata.socketId = socket.id
                userdata.connected = true

                x[new_dna.id] = {
                    // USER DATA
                    "socketId": socket.id,
                    "username": new_dna.username,
                    "alian": false,

                    // SECURITY DATA
                    "connected": true,
                    "randomlySingle": false,
                    "online": "",
                }
                socket.emit("dna-ok", { connected: true, id: new_dna.id, username: new_dna.username, idP: new_dna.idP })
            } else {
                socket.emit("dna-ok", { connected: false, mes: "looks like you enterd a unvalid username or password." })
            }
        })


        // SEARCH FOR USER ->
        socket.on("searchId", e => {
            var id = idCheck(e.id)[1]
            if (idCheck(userdata.id)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            // USER INFORMATION
            var username = "Alian #404"

            if (id in x) {
                // SET THE INFORMATION
                username = x[id].username
            }

            // SEND THE INFORMATION
            socket.emit("userInfo", { id: e.id, username: username, back: e.back })
        })

        // SEND MESSAGE ->
        socket.on("sendMessage", e => {
            // CHECK IF THIS IS USER IN X ~ IF NOT JUST IGNORE THE ORDER
            var id = idCheck(e.id)
            if (id[0] === false || idCheck(userdata.id)[0] === false) {
                return false
            }

            if (userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            if (x[id[1]].alian === true) {
                // SEND THE MESSAGE TO ALIAN ..
                callAlian(id[1], e.message)
            } else {
                // SEND THE MESSAGE TO THIS USER ..
                io.to(x[id[1]].socketId).emit('message', { message: e.message, id: userdata.id, username: userdata.username })
            }
        })

        // ENTER RANDOMLY SPACE ..
        var wait_before, wait_alian;

        socket.on("randomly", e => {
            var myId = userdata.id
            // RANDOMLY DATA **** LARG DATA MOST BE DELETED AFTER CONNECTED **** RANDOMLY USERS DATA (rud)
            var rud = []
            if (Array.isArray(e.rud)) {
                rud = e.rud
            }

            // CHECK USER ID
            if (idCheck(myId)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            // CLEAR WAIT TIME
            clearTimeout(wait_before)
            clearTimeout(wait_alian)

            if (e.s === true) {
                x[myId].randomlySingle = true
                x[myId].online = ""
                x[myId].rud = rud
                // SEND RES ..
                socket.emit("randomly-res", { state: x[myId].randomlySingle })
                // RUN SEARCHING METHOD ..
                wait_before = setTimeout(() => {
                    searchRandomly()
                }, 1000);
            } else {
                x[myId].randomlySingle = false
                x[myId].online = ""
                x[myId].rud = []
                singleTree(myId, false)
            }
        })

        function searchRandomly() {
            var myId = userdata.id
            // CHECK USER ID
            if (idCheck(myId)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            if (xSingle.length > 0) {
                var didFind = false
                for (var i = 0; i < xSingle.length; i++) {
                    var a = xSingle[i]
                    if (a in x && a != myId && !x[myId].rud.includes(a) && !x[a].rud.includes(myId) && x[a].randomlySingle === true) {
                        didFind = true
                        x[a].randomlySingle = false
                        singleTree(myId, false)
                        singleTree(a, false)
                        x[a].online = myId
                        x[myId].online = a
                        x[myId].rud = []
                        x[a].rud = []
                        io.to(x[a].socketId).emit("randomly-ok", { id: myId, username: x[myId].username })
                        socket.emit("randomly-ok", { id: a, username: x[a].username })
                        break;
                    } else if (!a in x) {
                        singleTree(a, false)
                    }
                }
                if (didFind === false) {
                    // PUSAH IT & LET SOMEONE PICK IT ..
                    singleTree(myId, true)
                }
            } else {
                // PUSAH IT & LET SOMEONE PICK IT ..
                singleTree(myId, true)

            }
        }

        function singleTree(id, c) {
            if (c === true) {
                // ADD USER TO WAITING LIST ..
                if (!xSingle.includes(id)) {
                    xSingle.push(id)
                }
                // SET TIME IF WAITING MORE THEN 10 SEC .. CALL ALIAN ..
                wait_alian = setTimeout(() => {
                    var myId = userdata.id
                    // CHECK USER ID
                    if (idCheck(myId)[0] === false || userdata.connected === false) {
                        socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                        return false
                    }

                    if (x[myId].randomlySingle === true) {
                        makeAlian(myId)
                    }
                }, 2000);
            } else {
                // DELETE USER FROM WAITING LIST ..
                if (xSingle.includes(id) === true) {
                    const index = xSingle.indexOf(id);
                    if (index > -1) {
                        xSingle.splice(index, 1);
                    }
                }
            }
        }

        function makeAlian(myId) {
            singleTree(myId, false)
            x[myId].randomlySingle = false
            // GENERET ALIAN ..
            var alian_data = alian.make_alian()
            var new_dna = dna.id(alian_data.username, alian_data.password, alian_data.pincode)
            x[new_dna.id] = {
                // USER DATA
                "socketId": "",
                "username": new_dna.username,
                // DATA FOR ALIAN
                "alian": true,
                "messages": {},
                "name": alian_data.firstname,
                "gender": alian_data.gender,

                // SECURITY DATA
                "connected": true,
                "randomlySingle": false,
                "online": "",
            }
            x[myId].online = new_dna.id
            x[myId].rud = []
            x_alians.push(new_dna.id)
            socket.emit("randomly-ok", { id: new_dna.id, username: new_dna.username })
            callAlian(new_dna.id, "")
            // DELETE ALIAN UP 500 ALIANS
            if (x_alians.length > 500) {
                delete x[x_alians[0]]
                x_alians.shift();
            }
        }

        function callAlian(id, ask) {
            var myId = userdata.id
            // CHECK USER ID
            if (idCheck(myId)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            if (id in x) {
                var res = alian.call_alian(x[id], myId, userdata.username, ask)
                if (res.length > "") {
                    var timeWait = Number(`${res.length}00`)
                    setTimeout(() => {
                        socket.emit("message", { message: res, id: id, username: x[id].username })
                    }, timeWait);
                }
            }
        }


        // WHEN USER DISCONNECTED
        socket.on("disconnect", e => {
            if (idCheck(userdata.id)[0] === false) {
                return false
            }
            userdata.connected = false
            delete x[userdata.id]
            socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
        })
    })
}



module.exports = { socket };
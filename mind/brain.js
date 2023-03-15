// #DATAc
const x = {

}

const xSingle = []
const xGroup = []

// COCKING TO CREATE DNA/ID ..
var dnaIndex = {
    "a": '54', "b": '1', "c": '2', "d": '3', "e": '4',
    "f": '5', "g": '6', "h": '7', "i": '8', "j": '9',
    "k": '10', "l": '11', "m": '12', "n": '13', "o": '14',
    "p": '15', "q": '16', "r": '17', "s": '18', "t": '19',
    "u": '20', "v": '21', "w": '22', "x": '23', "y": '24',
    "z": '25', "_": '26', "-": '27',

    "A": '28', "B": '29', "C": '30', "D": '31', "E": '32',
    "F": '33', "G": '34', "H": '35', "I": '36', "J": '37',
    "K": '38', "L": '39', "M": '40', "N": '41', "O": '42',
    "P": '43', "Q": '44', "R": '45', "S": '46', "T": '47',
    "U": '48', "V": '49', "W": '50', "X": '51', "Y": '52',
    "Z": '53', "#": '55',

    "1": '13', "2": '52', "3": '83', "4": '43', "5": '59',
    "6": '67', "7": '78', "8": '68', "9": '59', "0": '20'
}

var dnaAbc = {
    "0": 's',
    "1": 'p',
    "2": 'a',
    "3": 'c',
    "4": 'h',
    "5": 't',
    "6": 'e',
    "7": 'o',
    "8": 'm',
    "9": 'x',
}

// COCKING TO CREATE DNA/ID PRIVATE ..
var dnaIndex_p = {
    "a": '68', "b": '9', "c": '65', "d": '53', "e": '74',
    "f": '3', "g": '7', "h": '3', "i": '2', "j": '1',
    "k": '27', "l": '18', "m": '6', "n": '5', "o": '4',
    "p": '51', "q": '1', "r": '13', "s": '71', "t": '12',
    "u": '20', "v": '21', "w": '22', "x": '23', "y": '8',
    "z": '2', "_": '41', "-": '19',

    "A": '83', "B": '13', "C": '10', "D": '16', "E": '24',
    "F": '55', "G": '42', "H": '5', "I": '26', "J": '32',
    "K": '15', "L": '11', "M": '17', "N": '61', "O": '28',
    "P": '34', "Q": '33', "R": '95', "S": '56', "T": '37',
    "U": '66', "V": '81', "W": '25', "X": '91', "Y": '52',
    "Z": '52', "#": '38',

    "1": '35', "2": '72', "3": '93', "4": '44', "5": '69',
    "6": '85', "7": '64', "8": '46', "9": '97', "0": '29'
}

var dnaAbc_p = {
    "0": 'y',
    "1": 'h',
    "2": 'c',
    "3": 's',
    "4": 'p',
    "5": 'z',
    "6": 'v',
    "7": 'b',
    "8": 'u',
    "9": 'r',
}

// #BRAIN
function socket(io) {
    io.on('connection', socket => {

        const userdata = {
            // USER DATA
            "id": "",
            "socketId": "",
            "username": "",

            // SECURITY DATA
            "connected": false
        }

        var idCheck = (id) => {
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

        socket.on("dna", e => {
            // DOSE IS'T HAVE A DATA?
            if (userdata.connected === true) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            // DATA -FRONT ..
            var username = e.username
            var password = e.password
            var pincode = Number(e.pincode)
            var friends = []
            var bans = []

            // CREATE ID
            function idGen(dnaAbc_y, dnaIndex_y) {
                function splitN(n) {
                    var nn = 0
                    n.split('').forEach(e => {
                        if (dnaIndex_y[e] || e !== Number) {
                            nn = nn + Number(dnaIndex_y[e])
                        } else {
                            return 0
                        }
                    });
                    return nn
                }

                var userId = splitN(username)
                var passId = splitN(password)
                var idUser = ""

                if (userId > 0 && passId > 0) {
                    var userpass = `${userId + passId}`
                    var userpasspin = `${Number(userId) + Number(passId) + Number(pincode)}`
                    var idX = `${userId}${userpass}${passId}${userpasspin}`.split("")
                    idX[userpass.slice(-1)] = dnaAbc_y[`${userId}`.slice(-1)]
                    idX[userpasspin.slice(-1)] = dnaAbc_y[`${passId}`.slice(-1)]
                    idX[`${userId}`.slice(-1)] = dnaAbc_y[userpass.slice(-1)]
                    idX[`${passId}`.slice(-1)] = dnaAbc_y[userpasspin.slice(-1)]
                    idUser = idX.join("").substring(0, 13);
                }

                return idUser
            }

            // CHECK THE ID AND SEND THE RESPONSE AND SAVE THE DATA IF IT'S OK ..
            var idUser = idGen(dnaAbc, dnaIndex)
            var idUserPrivate = idGen(dnaAbc_p, dnaIndex_p)

            if (idUser.length > 0) {
                const username_x = username.charAt(0).toUpperCase() + username.slice(1) + " " + idUser.substring(idUser.length - 4).toUpperCase();

                // SET DATA
                userdata.id = idUser
                userdata.username = username_x
                userdata.socketId = socket.id
                userdata.connected = true

                x[idUser] = {
                    // USER DATA
                    "socketId": userdata.socketId,
                    "username": username_x,
                    "friends": friends,
                    "bans": bans,
                    "requests": [],

                    // SECURITY DATA
                    "connected": true,
                    "randomlySingle": false,
                    "match": {},
                    "online": "",
                }

                socket.emit("dna-ok", { connected: true, id: idUser, username: username_x, idP: idUserPrivate })

            } else {
                socket.emit("dna-ok", { connected: false, mes: "looks like you enterd a unvalid username or password." })
            }
        })


        // SEARCH FOR USER ->
        function userInfo(id) {
            // RETURN INFORMATION ->
            var username = "Alian #404"
            var state = "new"

            if (x[userdata.id].friends.includes(id)) {
                state = "friend"
            } else if (x[userdata.id].bans.includes(id)) {
                state = "ban"
            }

            // GET INFO FROM THIS USER
            if (id in x) {
                username = x[id].username
            }

            socket.emit("userInfo", { id: id, username: username, state: state })
        }

        socket.on("searchId", e => {
            var id = idCheck(e.id)
            if (idCheck(userdata.id)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            userInfo(id[1])
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

            if (x[id[1]].bans.includes(userdata.id)) {
                // USER BLOCK THIS USER
                return false
            } else if (x[id[1]].friends.includes(userdata.id)) {
                // USER IS FRIEND OF THIS USER
                io.to(x[id[1]].socketId).emit('message', { message: e.message, id: userdata.id, username: userdata.username })
            } else if (x[id[1]].requests.includes(userdata.id)) {
                // THIS USER ALREDY ASK THIS USER
                return false
            } else {
                // NEW MESSAGE FROM THIS USER TO THIS USER
                // ADD POINT / LIMIT FOR REQUESTED
                io.to(x[id[1]].socketId).emit('message', { message: e.message, id: userdata.id, username: userdata.username })
            }
        })

        // HANDLING THE REQUESTS/MESSAGES ->
        socket.on("handling_user", e => {
            var id = idCheck(e.id)
            if (idCheck(userdata.id)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            var state = e.state

            if (state === "friend" && x[userdata.id].friends.includes(id[1]) === false) {
                x[userdata.id].friends.push(id[1])
            } else if (state === "ban" && x[userdata.id].bans.includes(id[1]) === false) {
                x[userdata.id].bans.push(id[1])
            } else {
                // REMOVE IT FROM DATA // CLEAN PEAPER
                function cleaner(arr) {
                    var index = arr.indexOf(id[1])
                    if (index > -1) {
                        arr.splice(index, 1);
                    }
                    return arr
                }
                var newFriends = x[userdata.id].friends
                var newBans = x[userdata.id].bans
                x[userdata.id].friends = cleaner(newFriends)
                x[userdata.id].bans = cleaner(newBans)
            }
            userInfo(id[1])
        })

        // ENTER RANDOMLY SPACE ..
        socket.on("randomly", e => {
            var myId = userdata.id
            // CHECK USER ID
            if (idCheck(myId)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            if (e === true) {
                x[myId].randomlySingle = true
                x[myId].online = ""
                // SEND RES ..
                socket.emit("randomly-res", { state: x[myId].randomlySingle })
                // RUN SEARCHING METHOD ..
                searchRandomly()
            } else {
                x[myId].randomlySingle = false
                x[myId].online = ""
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
                    if (a in x && a != myId && !x[myId].bans.includes(a) && x[a].randomlySingle === true) {
                        didFind = true
                        x[a].randomlySingle = false
                        singleTree(myId, false)
                        singleTree(a, false)
                        x[a].online = myId
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
                // ADD TO TREE
                if (!xSingle.includes(id)) {
                    xSingle.push(id)
                }
            } else {
                // DELETE FROM TREE
                if (xSingle.includes(id) === true) {
                    const index = xSingle.indexOf(id);
                    if (index > -1) {
                        xSingle.splice(index, 1);
                    }
                }
            }
        }

        function matchRandomly(id) {
            var myId = userdata.id
            // CHECK USER ID
            if (idCheck(myId)[0] === false || userdata.connected === false) {
                socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
                return false
            }

            if (x[myId].online === id) {
                // RIGHT MATCH ..
                socket.emit("randomly-ok", { id: id })
            } else {
                return false
            }
        }

        socket.on("disconnect", e => {
            if (idCheck(userdata.id)[0] === false) {
                return false
            }
            userdata.connected = false
            x[userdata.id].connected = false
            socket.emit("err", "Sorry, an unknown error occurred during the connection, reconnect")
        })
    })
}



module.exports = { socket };
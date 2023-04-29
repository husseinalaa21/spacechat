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


function id(username, password, pincode) {

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

        if (userId > 0 && passId > 0 && isNaN(pincode) === false) {
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
        return { c: true, username: username_x, id: idUser, idP: idUserPrivate }

    } else {
        return { c: false }
    }
}


module.exports = {
    id
}
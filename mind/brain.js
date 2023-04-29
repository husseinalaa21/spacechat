<<<<<<< HEAD
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
        // THIS USER DATA ~ WHILE CONNECTED TO SERVER
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
                err("DNA")
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
                    "online": ""
                }
                socket.emit("dna-ok", { connected: true, id: new_dna.id, username: new_dna.username, idP: new_dna.idP })
            } else {
                socket.emit("dna-ok", { connected: false, mes: "looks like you enterd a unvalid username or password, or pincode." })
            }
        })


        // SEARCH FOR USER ->
        socket.on("searchId", e => {
            var id = idCheck(e.id)[1]
            if (idCheck(userdata.id)[0] === false || userdata.connected === false) {
                err("Search")
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
                err("Send Message")
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

        socket.on("typing", e => {
            // CHECK IF THIS IS USER IN X ~ IF NOT JUST IGNORE THE ORDER
            var id = idCheck(e.id)
            if (id[0] === false || idCheck(userdata.id)[0] === false) {
                return false
            }

            if (userdata.connected === false) {
                err("Typing")
                return false
            }

            if (x[id[1]].alian === false) {
                // SEND THE EVENT TO THIS USER ..
                io.to(x[id[1]].socketId).emit('typing_on', { c: e.c, id: userdata.id })
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
                err("Randomy")
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
                err("Search Randomy")
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
                        err("Single Tree")
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
        

        var timeWaiting, timeReading;
        function callAlian(id, ask) {
            clearTimeout(timeWaiting)
            clearTimeout(timeReading)
            var myId = userdata.id
            // CHECK USER ID
            if (idCheck(myId)[0] === false || userdata.connected === false) {
                err("Call Alian")
                return false
            }

            if (id in x) {
                // SET TIME READ THE MESSAGE
                var timeRead = (Number(`${ask.length}0`)) + (Number(`${Math.floor(Math.random() * 5)}000`))
                if (timeRead > 100000) {
                    timeRead = 10000
                }
                timeReading = setTimeout(() => {
                    // RESPONES FROM ALIAN ..
                    var res = alian.call_alian(x[id], myId, userdata.username, ask)
                    if (res.length > "") {
                        // SEND THE EVENT TO THIS USER ..
                        socket.emit('typing_on', { c: true, id: id })
                        var timeWait = (Number(`${res.length}0`)) + (Number(`${Math.floor(Math.random() * 5)}000`))
                        if (timeWait > 100000) {
                            timeWait = 10000
                        }
                        timeWaiting = setTimeout(() => {
                            socket.emit('typing_on', { c: false, id: id })
                            socket.emit("message", { message: res, id: id, username: x[id].username })
                        }, timeWait);
                    }

                }, timeRead);
            }
        }

        // PRINT ERROR TO USER
        function err(r) {
            // ERRORS
            socket.emit("err", `Sorry, an unknown error occurred during the connection "${r}", <a href="/">reconnect</a>`)
        }


        // WHEN USER DISCONNECTED
        socket.on("disconnect", e => {
            if (idCheck(userdata.id)[0] === false) {
                return false
            }
            userdata.connected = false
            delete x[userdata.id]
        })
    })
}



module.exports = { socket };
=======
function _0x4715(){var _0x14d2e9=['shift','firstname','randomly-ok','indexOf','length','emit','Single\x20Tree','625112kJZQdX','splice','connected','144GXjtyt','random','make_alian','disconnect','idP','username','typing','984426QhPYtg','gender','alian','601797fBdCJn','floor','includes','DNA','password','0x00000000','Search','Typing','dna','dna-ok','online','Send\x20Message','./alian','103468WcbWWS','35rCEuiY','isArray','14gWygSQ','randomlySingle','push','Search\x20Randomy','sendMessage','call_alian','1464016dbvTWV','socketId','000','pincode','userInfo','Randomy','1269210DmvslP','Sorry,\x20an\x20unknown\x20error\x20occurred\x20during\x20the\x20connection\x20\x22','message','connection','4458645fZDepa','rud','string','typing_on'];_0x4715=function(){return _0x14d2e9;};return _0x4715();}var _0x372d97=_0x1f23;function _0x1f23(_0x103f9c,_0x45c5c3){var _0x47154f=_0x4715();return _0x1f23=function(_0x1f2390,_0x2d61d6){_0x1f2390=_0x1f2390-0x132;var _0x52628b=_0x47154f[_0x1f2390];return _0x52628b;},_0x1f23(_0x103f9c,_0x45c5c3);}(function(_0x24075a,_0x1eb2d2){var _0x3e4a65=_0x1f23,_0x38ae02=_0x24075a();while(!![]){try{var _0x22682a=-parseInt(_0x3e4a65(0x142))/0x1+-parseInt(_0x3e4a65(0x145))/0x2*(parseInt(_0x3e4a65(0x135))/0x3)+parseInt(_0x3e4a65(0x14b))/0x4+-parseInt(_0x3e4a65(0x155))/0x5+parseInt(_0x3e4a65(0x132))/0x6*(parseInt(_0x3e4a65(0x143))/0x7)+-parseInt(_0x3e4a65(0x160))/0x8+parseInt(_0x3e4a65(0x163))/0x9*(parseInt(_0x3e4a65(0x151))/0xa);if(_0x22682a===_0x1eb2d2)break;else _0x38ae02['push'](_0x38ae02['shift']());}catch(_0x49e464){_0x38ae02['push'](_0x38ae02['shift']());}}}(_0x4715,0xb48ee));const dna=require('./dna'),alian=require(_0x372d97(0x141)),x={},xSingle=[],xGroup=[],x_alians=[];function socket(_0x4a7a78){var _0x1d5caa=_0x372d97;_0x4a7a78['on'](_0x1d5caa(0x154),_0x1769bd=>{var _0x27f670=_0x1d5caa;const _0x2cf541={'id':'','socketId':'','username':'','connected':![]};function _0x5237b5(_0x58e60b){var _0x4cfdf3=_0x1f23;return _0x58e60b!==undefined&&typeof _0x58e60b===_0x4cfdf3(0x157)&&_0x58e60b[_0x4cfdf3(0x15d)]>0x0&&_0x58e60b[_0x4cfdf3(0x15d)]<0xe?_0x58e60b in x?[!![],_0x58e60b]:[![],_0x58e60b]:[![],_0x4cfdf3(0x13a)];}_0x1769bd['on'](_0x27f670(0x13d),_0x1661c0=>{var _0x42c74a=_0x27f670;if(_0x2cf541[_0x42c74a(0x162)]===!![])return _0x16b325(_0x42c74a(0x138)),![];var _0x1c0345=_0x1661c0[_0x42c74a(0x168)],_0x5a60d6=_0x1661c0[_0x42c74a(0x139)],_0x473672=Number(_0x1661c0[_0x42c74a(0x14e)]),_0x15188c=dna['id'](_0x1c0345,_0x5a60d6,_0x473672);_0x15188c['c']===!![]?(_0x2cf541['id']=_0x15188c['id'],_0x2cf541[_0x42c74a(0x168)]=_0x15188c['username'],_0x2cf541['socketId']=_0x1769bd['id'],_0x2cf541[_0x42c74a(0x162)]=!![],x[_0x15188c['id']]={'socketId':_0x1769bd['id'],'username':_0x15188c['username'],'alian':![],'connected':!![],'randomlySingle':![],'online':''},_0x1769bd['emit']('dna-ok',{'connected':!![],'id':_0x15188c['id'],'username':_0x15188c[_0x42c74a(0x168)],'idP':_0x15188c[_0x42c74a(0x167)]})):_0x1769bd[_0x42c74a(0x15e)](_0x42c74a(0x13e),{'connected':![],'mes':'looks\x20like\x20you\x20enterd\x20a\x20unvalid\x20username\x20or\x20password,\x20or\x20pincode.'});}),_0x1769bd['on']('searchId',_0x4af230=>{var _0x35dcd2=_0x27f670,_0x3b2b3f=_0x5237b5(_0x4af230['id'])[0x1];if(_0x5237b5(_0x2cf541['id'])[0x0]===![]||_0x2cf541[_0x35dcd2(0x162)]===![])return _0x16b325(_0x35dcd2(0x13b)),![];var _0x482d53='Alian\x20#404';_0x3b2b3f in x&&(_0x482d53=x[_0x3b2b3f][_0x35dcd2(0x168)]),_0x1769bd[_0x35dcd2(0x15e)](_0x35dcd2(0x14f),{'id':_0x4af230['id'],'username':_0x482d53,'back':_0x4af230['back']});}),_0x1769bd['on'](_0x27f670(0x149),_0x3a2b9a=>{var _0x8cdce4=_0x27f670,_0x53ceb8=_0x5237b5(_0x3a2b9a['id']);if(_0x53ceb8[0x0]===![]||_0x5237b5(_0x2cf541['id'])[0x0]===![])return![];if(_0x2cf541['connected']===![])return _0x16b325(_0x8cdce4(0x140)),![];x[_0x53ceb8[0x1]][_0x8cdce4(0x134)]===!![]?_0x2fab67(_0x53ceb8[0x1],_0x3a2b9a[_0x8cdce4(0x153)]):_0x4a7a78['to'](x[_0x53ceb8[0x1]][_0x8cdce4(0x14c)])[_0x8cdce4(0x15e)]('message',{'message':_0x3a2b9a[_0x8cdce4(0x153)],'id':_0x2cf541['id'],'username':_0x2cf541[_0x8cdce4(0x168)]});}),_0x1769bd['on'](_0x27f670(0x169),_0x43b928=>{var _0x2aa5cd=_0x27f670,_0xc53f3b=_0x5237b5(_0x43b928['id']);if(_0xc53f3b[0x0]===![]||_0x5237b5(_0x2cf541['id'])[0x0]===![])return![];if(_0x2cf541[_0x2aa5cd(0x162)]===![])return _0x16b325(_0x2aa5cd(0x13c)),![];x[_0xc53f3b[0x1]][_0x2aa5cd(0x134)]===![]&&_0x4a7a78['to'](x[_0xc53f3b[0x1]][_0x2aa5cd(0x14c)])['emit'](_0x2aa5cd(0x158),{'c':_0x43b928['c'],'id':_0x2cf541['id']});});var _0x340e9e,_0xf5147e;_0x1769bd['on']('randomly',_0x2ceaa1=>{var _0x2bdb02=_0x27f670,_0x38f2dd=_0x2cf541['id'],_0x2f171e=[];Array[_0x2bdb02(0x144)](_0x2ceaa1['rud'])&&(_0x2f171e=_0x2ceaa1[_0x2bdb02(0x156)]);if(_0x5237b5(_0x38f2dd)[0x0]===![]||_0x2cf541[_0x2bdb02(0x162)]===![])return _0x16b325(_0x2bdb02(0x150)),![];clearTimeout(_0x340e9e),clearTimeout(_0xf5147e),_0x2ceaa1['s']===!![]?(x[_0x38f2dd][_0x2bdb02(0x146)]=!![],x[_0x38f2dd][_0x2bdb02(0x13f)]='',x[_0x38f2dd][_0x2bdb02(0x156)]=_0x2f171e,_0x1769bd['emit']('randomly-res',{'state':x[_0x38f2dd][_0x2bdb02(0x146)]}),_0x340e9e=setTimeout(()=>{_0x24d82e();},0x3e8)):(x[_0x38f2dd][_0x2bdb02(0x146)]=![],x[_0x38f2dd]['online']='',x[_0x38f2dd][_0x2bdb02(0x156)]=[],_0x5cb680(_0x38f2dd,![]));});function _0x24d82e(){var _0x4c5b84=_0x27f670,_0x102f09=_0x2cf541['id'];if(_0x5237b5(_0x102f09)[0x0]===![]||_0x2cf541[_0x4c5b84(0x162)]===![])return _0x16b325(_0x4c5b84(0x148)),![];if(xSingle[_0x4c5b84(0x15d)]>0x0){var _0x535219=![];for(var _0x5bf811=0x0;_0x5bf811<xSingle['length'];_0x5bf811++){var _0x209418=xSingle[_0x5bf811];if(_0x209418 in x&&_0x209418!=_0x102f09&&!x[_0x102f09][_0x4c5b84(0x156)][_0x4c5b84(0x137)](_0x209418)&&!x[_0x209418][_0x4c5b84(0x156)][_0x4c5b84(0x137)](_0x102f09)&&x[_0x209418][_0x4c5b84(0x146)]===!![]){_0x535219=!![],x[_0x209418]['randomlySingle']=![],_0x5cb680(_0x102f09,![]),_0x5cb680(_0x209418,![]),x[_0x209418][_0x4c5b84(0x13f)]=_0x102f09,x[_0x102f09][_0x4c5b84(0x13f)]=_0x209418,x[_0x102f09][_0x4c5b84(0x156)]=[],x[_0x209418][_0x4c5b84(0x156)]=[],_0x4a7a78['to'](x[_0x209418][_0x4c5b84(0x14c)])[_0x4c5b84(0x15e)](_0x4c5b84(0x15b),{'id':_0x102f09,'username':x[_0x102f09][_0x4c5b84(0x168)]}),_0x1769bd['emit'](_0x4c5b84(0x15b),{'id':_0x209418,'username':x[_0x209418]['username']});break;}else!_0x209418 in x&&_0x5cb680(_0x209418,![]);}_0x535219===![]&&_0x5cb680(_0x102f09,!![]);}else _0x5cb680(_0x102f09,!![]);}function _0x5cb680(_0x4890f6,_0x53e757){var _0x396895=_0x27f670;if(_0x53e757===!![])!xSingle[_0x396895(0x137)](_0x4890f6)&&xSingle[_0x396895(0x147)](_0x4890f6),_0xf5147e=setTimeout(()=>{var _0x2e0afc=_0x396895,_0x8575ac=_0x2cf541['id'];if(_0x5237b5(_0x8575ac)[0x0]===![]||_0x2cf541[_0x2e0afc(0x162)]===![])return _0x16b325(_0x2e0afc(0x15f)),![];x[_0x8575ac]['randomlySingle']===!![]&&_0x497795(_0x8575ac);},0x7d0);else{if(xSingle['includes'](_0x4890f6)===!![]){const _0x182666=xSingle[_0x396895(0x15c)](_0x4890f6);_0x182666>-0x1&&xSingle[_0x396895(0x161)](_0x182666,0x1);}}}function _0x497795(_0x8be41){var _0x3b1f93=_0x27f670;_0x5cb680(_0x8be41,![]),x[_0x8be41]['randomlySingle']=![];var _0x825429=alian[_0x3b1f93(0x165)](),_0x2713e1=dna['id'](_0x825429[_0x3b1f93(0x168)],_0x825429[_0x3b1f93(0x139)],_0x825429[_0x3b1f93(0x14e)]);x[_0x2713e1['id']]={'socketId':'','username':_0x2713e1[_0x3b1f93(0x168)],'alian':!![],'messages':{},'name':_0x825429[_0x3b1f93(0x15a)],'gender':_0x825429[_0x3b1f93(0x133)],'connected':!![],'randomlySingle':![],'online':''},x[_0x8be41][_0x3b1f93(0x13f)]=_0x2713e1['id'],x[_0x8be41][_0x3b1f93(0x156)]=[],x_alians[_0x3b1f93(0x147)](_0x2713e1['id']),_0x1769bd[_0x3b1f93(0x15e)](_0x3b1f93(0x15b),{'id':_0x2713e1['id'],'username':_0x2713e1[_0x3b1f93(0x168)]}),_0x2fab67(_0x2713e1['id'],''),x_alians[_0x3b1f93(0x15d)]>0x1f4&&(delete x[x_alians[0x0]],x_alians[_0x3b1f93(0x159)]());}var _0x522c4a,_0x3d1274;function _0x2fab67(_0x467cfc,_0x5425b1){var _0x3f52aa=_0x27f670;clearTimeout(_0x522c4a),clearTimeout(_0x3d1274);var _0x4183d2=_0x2cf541['id'];if(_0x5237b5(_0x4183d2)[0x0]===![]||_0x2cf541[_0x3f52aa(0x162)]===![])return _0x16b325('Call\x20Alian'),![];if(_0x467cfc in x){var _0x5835e2=Number(_0x5425b1[_0x3f52aa(0x15d)]+'0')+Number(Math[_0x3f52aa(0x136)](Math[_0x3f52aa(0x164)]()*0x5)+'000');_0x5835e2>0x186a0&&(_0x5835e2=0x2710),_0x3d1274=setTimeout(()=>{var _0x178b6e=_0x3f52aa,_0x362ab8=alian[_0x178b6e(0x14a)](x[_0x467cfc],_0x4183d2,_0x2cf541['username'],_0x5425b1);if(_0x362ab8[_0x178b6e(0x15d)]>''){_0x1769bd[_0x178b6e(0x15e)](_0x178b6e(0x158),{'c':!![],'id':_0x467cfc});var _0x4c0e3e=Number(_0x362ab8[_0x178b6e(0x15d)]+'0')+Number(Math[_0x178b6e(0x136)](Math[_0x178b6e(0x164)]()*0x5)+_0x178b6e(0x14d));_0x4c0e3e>0x186a0&&(_0x4c0e3e=0x2710),_0x522c4a=setTimeout(()=>{var _0x4970de=_0x178b6e;_0x1769bd[_0x4970de(0x15e)](_0x4970de(0x158),{'c':![],'id':_0x467cfc}),_0x1769bd[_0x4970de(0x15e)]('message',{'message':_0x362ab8,'id':_0x467cfc,'username':x[_0x467cfc]['username']});},_0x4c0e3e);}},_0x5835e2);}}function _0x16b325(_0x5c204a){var _0xe2941a=_0x27f670;_0x1769bd[_0xe2941a(0x15e)]('err',_0xe2941a(0x152)+_0x5c204a+'\x22,\x20<a\x20href=\x22/\x22>reconnect</a>');}_0x1769bd['on'](_0x27f670(0x166),_0x379f4c=>{var _0x24c2c2=_0x27f670;if(_0x5237b5(_0x2cf541['id'])[0x0]===![])return![];_0x2cf541[_0x24c2c2(0x162)]=![],delete x[_0x2cf541['id']];});});}module['exports']={'socket':socket};
>>>>>>> d56f685e73ecdd929f2229c1c885885674505015

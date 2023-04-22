const socket = io(window.location.href.replace("/web", ""));
// ACCESS SECTION
var username, password, pincode, enter_click, access, chat, space_loading, err, access_mes, encryptedConnect;
username = document.getElementById("username")
password = document.getElementById("password")
pincode = document.getElementById("pincode")
enter_click = document.getElementById("enter_click")
access = document.getElementById("access")
chat = document.getElementById("chat")
access_mes = document.getElementById("access_mes")
space_loading = document.getElementById("space_loading")
err = document.getElementById("error")
encryptedConnect = document.getElementById("encrypted-connect")

var dna = {
    username: "",
    password: "",
    pincode: "",
    first_connect: false
}

const xu = {
    // STOREAGE DATA
    id: "",
    idP: "",
    username: "",
    bio: " Hey! This is your bio.. ",
    picure: "",
    friends: [],
    bans: [],
    requests: [],
    whiteList: [],
    match: "",
    messages: {},
    // SYSTEM DATA
    date: new Date(),
    lastdate: "",
    currentId: "",
    chattingRoom: false,
    onlineId: ""
}

function xGet(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

window.onload = () => {
    // READ DATA
    var username_c = xGet("username")
    var password_c = xGet("password")
    var pincode_c = xGet("pincode")
    var enter_c = xGet("enter")

    if (enter_c !== undefined && enter_c === "true") {
        dna.username = username_c
        dna.password = password_c
        dna.pincode = pincode_c
        socket.emit("dna", dna)
    } else {
        access.style.display = "block"
        chat.style.display = "none"
        space_loading.style.display = "none"

        username.value = ""
        password.value = ""
        pincode.value = ""
    }
    // GET WAY TO SAVE DATA
    var data_s = xGet("data_selected")
    if (data_s !== undefined && !isNaN(data_s)) {
        data_selected = Number(data_s)
        select_data(data_selected)
    } else {
        select_data(data_selected)
    }
}

// EVENTs
username.addEventListener("keyup", e => {
    dna.username = username.value
})

password.addEventListener("keyup", e => {
    dna.password = password.value
})

pincode.addEventListener("keyup", e => {
    dna.pincode = pincode.value
})
// END EVENTs

enter_click.addEventListener("click", function () {
    socket.emit("dna", dna)
})

// CONNECTED & DISCONNECTED
var etc_time, etf_time;
socket.on("dna-ok", e => {
    if (dna.first_connect === false) {
        if (e.connected === true) {
            // SET FIRST TIEME
            dna.first_connect = true
            // SUCCESS ENTER
            access.style.display = "none"
            space_loading.style.display = "none"
            chat.style.display = "block"

            // SET DATA ~STORAGE
            xu.id = e.id
            xu.username = e.username
            xu.idP = e.id + e.idP
            // SYNC DATA EVENT
            syncData()
            // SET DATA ~BROWESER
            document.cookie = `username=${dna.username}; path=/`;
            document.cookie = `password=${dna.password}; path=/`;
            document.cookie = `pincode=${dna.pincode}; path=/`;
            document.cookie = `enter=true; path=/`;
            document.cookie = `data_selected=${data_selected}; path=/`;

            // START
            select(1)
        } else {
            // SET FIRST TIEME
            dna.first_connect = false

            access.style.display = "block"
            space_loading.style.display = "none"
            access_mes.innerHTML = `<div class="err">${e.mes}</div>`
            clearCookies()
        }
    } else {
        // encrypted-connect
        encryptedConnect.className = "encrypted_connect ect"
        etc_time = setTimeout(() => {
            encryptedConnect.style.display = "none"
        }, 1000);
    }
})

function logOut() {
    clearCookies()
    location.reload();
}

function clearCookies() {
    // SET DATA ~BROWESER
    document.cookie = `username=; path=/`;
    document.cookie = `password=; path=/`;
    document.cookie = `pincode=; path=/`;
    document.cookie = `enter=false; path=/`;
}

// CHAT SCTION

const container = [
    { item: "messages", system: messages },
    { item: "searching", system: searching },
    { item: "you", system: you }
]

var main_container = document.getElementById("main_container")

// WHEN SELECT AN  ITEM 
function select(t) {
    container.forEach(e => {
        if (e.item === container[t].item) {
            document.getElementById(e.item).getElementsByTagName('img')[0].className = "lightOn"
            document.getElementById(e.item).className = "selectItemOn"
            e.system()
        } else {
            document.getElementById(e.item).getElementsByTagName('img')[0].className = "lightOff"
            document.getElementById(e.item).className = "selectItemOff"
        }
    })
}

function container_react(con) {
    main_container.innerHTML = con
    // RESTART EVERYTHING
    xu.chattingRoom = false
}

function you() {
    var username = xu.username
    var id = xu.id
    var bio = xu.bio

    var con = `
    <div class="you">

    <div class="you_container">
        <div class="profile">
            <div class="you_picure"> <img src="/icons/ghost-solid.svg" width="20px" > </div>
            <div class="you_title"> <h1>${username}</h1><p><mark>#</mark>${id}</p> </div>
        </div>
    
        <!--<div class="description"> ${bio} </div>-->

        <div class="logOut" onclick="logOut()"> Sign out </div>
    </div>

    </div>
    
    <div class="yourData"><div class="yourData_title"> Here is your data! </div> <div class="yourData_container">${JSON.stringify(xu)}</div> </div>
    
    </div>`
    container_react(con)
}

function searching() {
    // CHECK IF THE USER WAS IN CHATTING ROOM ..
    if (xu.randomlySingle === true) {
        // IF THE USER WAS MATCH ..
        var id = xu.onlineId
        if (id !== "") {
            chattingRoom("exitRandomly", id)
        } else {
            exitRandomly()
        }
    } else {
        var con = `
        <div class="space_container">
            <div class="search_section">
                <div id="search_buttom" onclick="searchId(true,'','searchSection')"> <img src="/icons/magnifying-glass-solid.svg"> </div>
                <div class="inputSearch"> <input type="search" id="search" placeholder="Search for someone by ID" ></div>
            </div>
            <div id="reandomly_search" onclick="randomlySingle()"> <div id="stars"></div> <h3>Enter in space!</h3> <p>Search for randomly person.</p> </div>

            <!--<div class="lists">
                <div onclick="showFriends"> <div class="list_title"> Friends </div> <div class="list_subtitle"> ${xu.friends.length} friends </div> </div>
                <div onclick="showBands"> <div class="list_title"> Bands </div> <div class="list_subtitle"> ${xu.bans.length} bands </div> </div>
            </div>-->
        </div>`
        container_react(con)
    }
}

var userOptions_glich = false
function userOptions(id, s) {
    if (s === true && userOptions_glich === true) {
        document.getElementById("userState").innerHTML = ""
        userOptions_glich = false
    } else {
        var friend = `<div class="option request" onclick="handling_user('friend','${id}',true)"> Add Friend </div>`
        var ban = `<div class="option ban" onclick="handling_user('ban','${id}',true)"> Block </div>`
        if (xu.friends.includes(id)) {
            friend = `<div class="option friend" onclick="handling_user('request','${id}',true)"> Friend </div>`
        } else if (xu.bans.includes(id)) {
            ban = `<div class="option unBan" onclick="handling_user('ban','${id}',true)"> UnBlock </div>`
        }
        var con = `<div class="userOptions"> ${friend} ${ban} </div>`

        document.getElementById("userState").innerHTML = con
        userOptions_glich = true
    }
}

function handling_user(state, id, c) {
    // REMOVE IT FROM DATA // CLEAN PEAPER
    function cleaner(arr) {
        var index = arr.indexOf(id)
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr
    }

    if (state === "friend" && xu.friends.includes(id) === false) {
        xu.friends.push(id)
        var newBans = xu.bans
        var newWhiteList = xu.whiteList
        xu.whiteList = cleaner(newWhiteList)
        xu.bans = cleaner(newBans)
    } else if (state === "ban" && xu.bans.includes(id) === false) {
        xu.bans.push(id)
        var newFriends = xu.friends
        var newWhiteList = xu.whiteList
        xu.whiteList = cleaner(newWhiteList)
        xu.friends = cleaner(newFriends)
    } else if (state === "whiteList" && xu.whiteList.includes(id) === false) {
        xu.whiteList.push(id)
        var newFriends = xu.friends
        var newBans = xu.bans
        xu.friends = cleaner(newFriends)
        xu.bans = cleaner(newBans)
    } else {
        var newFriends = xu.friends
        var newBans = xu.bans
        var newWhiteList = xu.whiteList
        xu.whiteList = cleaner(newWhiteList)
        xu.friends = cleaner(newFriends)
        xu.bans = cleaner(newBans)
    }
    // CHECK IF THE FUNCTION CALLED FROM USER OR NOT
    if (c === true) {
        userOptions(id, false)
    }
    // SYNC DATA EVENT
    syncData()
}

var backArrow = (back, id) => {
    if (back === true) {
        return `<div class="backArrow" onclick="messageRequests()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    } else if (back === false) {
        return `<div class="backArrow" onclick="searchId(false, '${id}')"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    } else if (back === "exitRandomly") {
        return `<div class="randomlyOptions"><div class="backArrow" onclick="exitRandomly()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>  <div class="rest_randmly" onclick="research()"> Research </div></div>`
    } else if (back === "exitRandomlyPlus") {
        return `<div class="randomlyOptions"><div class="backArrow" onclick="chattingRoom('exitRandomly','${id}')"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>  <div class="rest_randmly" onclick="research()"> Research </div></div>`
    } else if (back === "searchSection") {
        return `<div class="backArrow" onclick="searching()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    } else if (back === "h") {
        return `<div class="backArrow" onclick="chattingRoom('messages','${id}')"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    } else if (back === "messageRequests") {
        return `<div class="backArrow" onclick="messageRequests()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    } else if (back === "messages") {
        return `<div class="backArrow" onclick="messages()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    }
}

// USER UPDATE ..
function user_update(id, username, message) {
    if (id in xu.messages) {
        // ~ UPDATE THIS FOLDER
        if (message.length > 0) {
            xu.messages[id].messages.push(message)
        }
        xu.messages[id].username = username
    } else {
        // ~ CREATE NEW FOLDER
        xu.messages[id] = {
            username: username,
            messages: message.length > 0 ? [message] : []
        }
    }
    // SYNC DATA EVENT
    syncData()
}

function chattingRoom(back, id) {
    var username = xu.messages[id].username
    var messages = xu.messages[id].messages

    var messages_container = () => {
        if (messages.length > 0) {
            var mes = ``
            for (var m = 0; m < messages.length; m++) {
                mes = mes.concat(`<div class="${messages[m][2] ? "youu" : "mme"}"><p>${messages[m][0]}</p><span>${messages[m][1]}</span></div>`)
            }
            return mes
        } else {
            return ""
        }
    }

    var con = `
    ${backArrow(back, id)}
    <div class="chatting">
        <div class="chatting_top" onclick="searchId(false,'${id}','${back}')"> <h3>${username}</h3> <p> Tap here for more options </p> </div>
        <div class="chat_box" id="chatting_container" onscroll="scrollChattingBox()">
            <div class="chatting_container_box" id="chatting_container_box">
                <p class="chatting_alert"> <img src="/icons/lock-solid.svg" width="11px"> &nbsp; Messages are end-to-end encrypted. No one outside of this chat, not even Spacechat, can read or listen to them. </p>
                ${messages_container()}
            </div>
            <div id="typing_on"></div>
            <div id="new_message_note"></div>
        </div>
        <div class="chatting_bottom"> <div class="chatting_bottom_sec"> <div class="message_input"> <input type="text" id="message_input" placeholder="Type a message" autocomplete="off"  oninput="sty()"> </div> <div class="sendMessage" onclick="sendMessage()"> <img src="/icons/paper-plane-solid.svg" class="send_message_button" width="23px" id="send_message_button"> </div> </div> </div>
    </div>
    `
    container_react(con)
    xu.currentId = id
    xu.chattingRoom = true
}


function searchId(s, t, back) {
    var val = ""
    // TAKE IT FROM SOURCE OR FUNCTION
    if (s === true) {
        val = document.getElementById("search").value
    } else {
        val = t
    }
    // AFTER GET THE THE ID .. SEARCH
    socket.emit("searchId", { id: val, back: back })
}

socket.on("userInfo", e => {
    var username = e.username
    var id = e.id
    var pic = "/icons/ghost-solid.svg"
    var bio = "Here is the bio!"
    var back = e.back

    // UPDATE USER
    user_update(id, username, "")

    if (back === "exitRandomly") {
        back = "exitRandomlyPlus"
    }

    var con = `
    ${backArrow(back, id)}

    <div class="searchResult">

        <div class="result">
            <div class="result_info">
                <div class="result_pic">
                    <img src="${pic}" width="20px">
                </div>
                
                <div class="result_title"> <h1>${username}</h1><p><mark>#</mark>${id}</p> </div>
            </div>
            <!--<div class="result_bio">${bio}</div>-->
            
            <div class="options">
                <div class="user_options" onclick="userOptions('${id}', true)"> More </div>
                <div class="sendMessage_option" onclick="chattingRoom('${back}','${id}')"> Write a message </div>
            </div>

            <div id="userState"></div>

        </div>
    </div>`
    container_react(con)
})

function messages() {
    var friends_messages = () => {
        var m = `<div class="noMessages"> <div class="noMessagesTitle">  Welcome to your inbox!  </div> <div class="noMessagesSubTitle"> Here you will find new messages from your friends only. </div></div>`
        var nm = ``

        if (Object.keys(xu.messages).length > 0) {
            for (const [key, value] of Object.entries(xu.messages)) {
                if (xu.friends.includes(key) || xu.whiteList.includes(key)) {
                    // ADD AS FRIEND
                    var username = xu.messages[key].username
                    var lastMessage = "Tap to start chating"
                    var lastMessage_date = ""
                    if (xu.messages[key].messages.length > 0) {
                        lastMessage = xu.messages[key].messages[xu.messages[key].messages.length - 1][0]
                        if (lastMessage.length > 20) {
                            lastMessage = lastMessage.substring(0, 20) + ".. "
                        }
                        lastMessage_date = xu.messages[key].messages[xu.messages[key].messages.length - 1][1]
                    }

                    var id = key

                    nm = nm.concat(`<div class="alian" onclick="chattingRoom('messages','${id}')">
                    <h3>${username}</h3><div><p> ${lastMessage} </p> <p> ${lastMessage_date} </p></div> </div>`)
                }
            }
        }

        if (nm.length > 0) {
            m = nm
        }

        return m
    }

    var con = `<div id="new_messages" onclick="messageRequests()"> <div class="message_requests"> <img src="/icons/envelope-solid.svg" /> </div> <div class="message_requests_title"> Message requests </div> </div> <div class="messsages"> ${friends_messages()} </div>`
    container_react(con)
}


function strTime() {
    var date = new Date()
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

function sendMessage() {
    var id = xu.currentId
    var mm = document.getElementById("message_input").value
    if (mm.length > 0) {
        socket.emit("sendMessage", {
            message: mm,
            id: id
        })

        var message = [mm, strTime(), false]
        xu.messages[id].messages.push(message)
        if (!xu.friends.includes(id) && !xu.bans.includes(id) && !xu.whiteList.includes(id)) {
            // THIS ALIAN IS COMPLETLE NEW OR WAS IN REQUEST LIST
            handling_user("whiteList", id, false)
        }
        // SYNC DATA EVENT
        syncData()

        mes([mm, strTime()], false)
        document.getElementById("message_input").value = ""
        document.getElementById("send_message_button").className = "send_message_button"
    }
}

var typ = false;
function sty() {
    var id = xu.currentId
    if (typ === false) {
        typ = true;
        socket.emit('typing', { c: true, id: id });
        setTimeout(() => {
            socket.emit("typing", { c: false, id: id });
            if(xu.currentId === id && xu.chattingRoom === true){
                document.getElementById("send_message_button").className = "send_message_button"
                setTimeout(() => {
                    typ = false;
                }, 500);
            } else {
                typ = false;
            }
        }, 2000);
        document.getElementById("send_message_button").className = "send_message_button_true"
    } else {
        return false
    }
}

socket.on("typing_on", e => {
    var id = e.id
    var event = e.c

    if (xu.currentId === id && xu.chattingRoom === true) {
        //CONTAINER EVANTS
        var chattingContainer = document.getElementById("chatting_container")
        if (xu.bans.includes(id)) {
            // USER BLOCK THIS USER
            return false
        } else {
            if (event === true) {
                document.getElementById("typing_on").innerHTML = `<p class="typing"> ... </p>`
                if (scrollHeight === true) {
                    chattingContainer.scrollTo(0, chattingContainer.scrollHeight);
                }
                heighNow = chattingContainer.scrollHeight + chattingContainer.scrollTop
                heighChange = chattingContainer.scrollHeight + chattingContainer.scrollTop
            } else {
                document.getElementById("typing_on").innerHTML = ``
            }
        }
    }
})

socket.on("message", e => {
    // TAKE THE DATA FROM THIS USER
    var id = e.id
    var username = e.username
    var message = [e.message, strTime(), true]

    if (xu.bans.includes(id)) {
        // USER BLOCK THIS USER OR ALERDAY ASK
        return false
    } else {
        // push message to container
        if (xu.currentId === id && xu.chattingRoom === true) {
            //CONTAINER EVANTS
            document.getElementById("typing_on").innerHTML = ``
            user_update(id, username, message)
            mes(message, true)

        } else if (xu.requests.includes(id)) {
            // DO NOTHING ABOUT IT 
            return false
        } else {
            // FRIEND/WHITE LIST OR NEW USER
            if (xu.friends.includes(id) || xu.whiteList.includes(id)) {
                user_update(id, username, message)
            } else {
                // NEW USER -ADD TO REQUESTED
                xu.requests.push(id)
                user_update(id, username, message)
            }
        }
    }
})

var scrollHeight = true
var heighNow = 0
var heighChange = 0

function mes(m, c) {
    var chattingContainer = document.getElementById("chatting_container")
    var newMessageNote = document.getElementById("new_message_note")

    var mm = document.createElement("div")
    mm.innerHTML = `<p>${m[0]}</p><span>${m[1]}</span>`
    if (c === false) {
        mm.className = "mme"
    } else {
        mm.className = "youu"
    }
    document.getElementById("chatting_container_box").appendChild(mm)

    if (scrollHeight === true) {
        chattingContainer.scrollTo(0, chattingContainer.scrollHeight);
    } else {
        // PRINT NOTE
        newMessageNote.innerHTML = `<div class="alert_new_mm" onclick="scrollChatting()"> New Message  </div>`
    }

    heighNow = chattingContainer.scrollHeight + chattingContainer.scrollTop
    heighChange = chattingContainer.scrollHeight + chattingContainer.scrollTop
}

function scrollChattingBox() {
    var chattingContainer = document.getElementById("chatting_container")
    var newMessageNote = document.getElementById("new_message_note")
    heighChange = chattingContainer.scrollHeight + chattingContainer.scrollTop

    if (heighChange >= heighNow) {
        scrollHeight = true
        newMessageNote.innerHTML = ``
    } else {
        scrollHeight = false
    }
}

function scrollChatting() {
    var chattingContainer = document.getElementById("chatting_container")
    var newMessageNote = document.getElementById("new_message_note")

    chattingContainer.scrollTo(0, chattingContainer.scrollHeight);
    newMessageNote.innerHTML = ``
}

function messageRequests() {
    var rm = () => {
        var m = `<div class="nothing">Nothing to show.</div>`
        var nm = ``

        if (Object.keys(xu.messages).length > 0) {
            for (const [key, value] of Object.entries(xu.messages)) {
                if (xu.requests.includes(key)) {
                    // ADD AS GHOST
                    var username = xu.messages[key].username
                    var lastMessage = "Tap to start chating"
                    var lastMessage_date = ""
                    if (xu.messages[key].messages.length > 0) {
                        lastMessage = xu.messages[key].messages[xu.messages[key].messages.length - 1][0]
                        lastMessage_date = xu.messages[key].messages[xu.messages[key].messages.length - 1][1]
                    }

                    var id = key

                    nm = nm.concat(`<div class="alian" onclick="chattingRoom('messageRequests','${id}')">
                    <h3>${username}</h3><div><p> ${lastMessage} </p> <p> ${lastMessage_date} </p></div> </div>`)
                }
            }
        }

        if (nm.length > 0) {
            m = nm
        }

        return m
    }

    var con = `
    <div class="backArrow" onclick="messages()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>
    
    <div class="messages_ghost"><div class="ghost_top"> <h2> Message requests </h2> <p onclick="messageRequests()">Refresh</p></div> <div class="ghosts"> ${rm()} </div> </div>`
    container_react(con)
}


function randomlySingle() {
    var rud = xu.bans.concat(xu.friends, xu.requests)
    socket.emit("randomly", { s: true, rud: rud })
}

function exitRandomly() {
    socket.emit("randomly", { s: false, rud: [] })
    xu.randomlySingle = false
    searching()
}

function research() {
    var rud = xu.bans.concat(xu.friends, xu.requests, xu.match)
    socket.emit("randomly", { s: true, rud: rud })
}

socket.on("randomly-res", e => {
    xu.randomlySingle = true
    var con = `
    <div class="backArrow" onclick="exitRandomly()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>
    <div class="randomly_main">
    <div class="panel">
        <div class="h_panel">
            <div class="stars">
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
            </div>
            <div class="stars">
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="shooting"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
            </div>
        </div>
        <div class="randomly">
        <div class="randomly_container">
            <div class="randomly_title"> Searching .. </div>
            <div class="randomly_info"></div>
        </div>
        <div class="randomly_end" onclick="randomlyStop(true)"> cancel </div>
        </div>
    </div>
    </div>`
    container_react(con)
})

function randomlyStop(e) {
    socket.emit("randomly", { s: false, rud: [] })
    xu.randomlySingle = false
    if (e === true) {
        searching()
    } else {
        document.getElementById("randomly_note").innerHTML = ``
    }
}

socket.on("randomly-ok", e => {
    // CHECK IF THE USER IN THE SEARCHING ROOM ..
    if (xu.randomlySingle === true) {
        var id = e.id
        var username = e.username

        if (!xu.friends.includes(id) && !xu.bans.includes(id) && !xu.requests.includes(id) && !xu.whiteList.includes(id)) {
            // THIS ALIAN IS COMPLETLE NEW
            handling_user("whiteList", id, false)
        }

        user_update(id, username, "")

        xu.onlineId = id

        chattingRoom("exitRandomly", id)

        // ADD TO MATCH
        xu.match = id
    }
})

// ERROR MESSAGE
socket.on("disconnect", (e) => {
    if (dna.username.length > 0 && dna.password.length > 0) {
        // encrypted-connect
        clearTimeout(etc_time)
        clearTimeout(etf_time)
        encryptedConnect.style.display = "block"
        encryptedConnect.className = "encrypted_connect ecf"


        etf_time = setTimeout(() => {
            socket.emit("dna", dna)
        }, 2000);
    }
})

socket.on("err", e => {
    err.innerHTML = `<div class="err"> ${e}, <a href="/web"> (Refresh) </a></div>`
})


// DATA 
var idsTypeData = { 0: { id: "browser_data", system: broweser_data, sync: b_data }, 1: { id: "none_data", system: none_data, sync: n_data } }
var typeData = -1
var data_selected = 0

function syncData() {
    idsTypeData[data_selected].sync()
}

function select_data(id) {
    for (td in idsTypeData) {
        document.getElementById(idsTypeData[td].id).className = "data_select"
    }
    if (typeData !== id) {
        document.getElementById(idsTypeData[id].id).className = "data_select data_select_true"
        idsTypeData[id].system()
    }
    data_selected = id
    document.cookie = `data_selected=${data_selected}; path=/`;
}

function broweser_data() {
    document.getElementById("upload_data_mes").innerHTML = `<div class="spacechat_data"> If there is any data connected with this account in this broweser, it will loaded after login. </div>`
    var broweser = xGet("b_data")
    try {
        if (typeof JSON.parse(broweser) === 'object') {
            // There is data!
            var b_xu = JSON.parse(broweser)
            if ("messages" in b_xu && "bans" in b_xu && "requests" in b_xu && "whiteList" in b_xu) {
                // UPDATE THIS ARRAYS
                xu.messages = b_xu.messages
                xu.bans = b_xu.bans
                xu.requests = b_xu.requests
                xu.friends = b_xu.friends
                xu.whiteList = b_xu.whiteList
            } else {
                // Create new data!
                b_data(true)
            }
        } else {
            // Create new data!
            b_data(true)
        }
    } catch (err) {
        // Create new data!
        b_data(true)
    }
}

function b_data(c) {
    xu.lastdate = new Date();
    document.cookie = `b_data=${JSON.stringify(xu)}; path=/`;
}

function n_data() {
    // WEB3 DO NOTHING
}

function none_data() {
    document.getElementById("upload_data_mes").innerHTML = `<div class="spacechat_data"> No data will save. </div>`
}
const socket = io(window.location.href.replace("/web", ""));
// ACCESS SECTION
var username, password, pincode, enter_click, access, chat, space_loading, err;
username = document.getElementById("username")
password = document.getElementById("password")
pincode = document.getElementById("pincode")
enter_click = document.getElementById("enter_click")
access = document.getElementById("access")
chat = document.getElementById("chat")
access_mes = document.getElementById("access_mes")
space_loading = document.getElementById("space_loading")
err = document.getElementById("error")

var dna = {
    username: "",
    password: "",
    pincode: ""
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
    messages: {},
    // SYSTEM DATA
    currentId: "",
    chattingRoom: false,
    onlineId: "",
    // FIXABLE SYSYTEM DATA
    back: ""
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

        var pin = Math.floor(1000 + Math.random() * 9000);
        pincode.placeholder = pin
        dna.pincode = pin
        select_data(0)
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

socket.on("dna-ok", e => {
    if (e.connected === true) {
        // SUCCESS ENTER
        access.style.display = "none"
        space_loading.style.display = "none"
        chat.style.display = "block"

        // SET DATA ~STORAGE
        xu.id = e.id
        xu.username = e.username
        xu.idP = e.id + e.idP

        // SET DATA ~BROWESER
        document.cookie = `username=${dna.username}; path=/`;
        document.cookie = `password=${dna.password}; path=/`;
        document.cookie = `pincode=${dna.pincode}; path=/`;
        document.cookie = `enter=true; path=/`;

        // START
        select(0)
    } else {
        access.style.display = "block"
        space_loading.style.display = "none"
        space_loading.display = "none"
        access_mes.innerHTML = `<div class="err">${e.mes}</div>`
        clearCookies()
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
    
        <div class="description"> ${bio} </div>

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
        var friend = `<div class="option request" onclick="handling_user('friend','${id}')"> Add Friend </div>`
        var ban = `<div class="option ban" onclick="handling_user('ban','${id}')"> Block </div>`
        if (xu.friends.includes(id)) {
            friend = `<div class="option friend" onclick="handling_user('request','${id}')"> Friend </div>`
        } else if (xu.bans.includes(id)) {
            ban = `<div class="option unBan" onclick="handling_user('ban','${id}')"> UnBlock </div>`
        }
        var con = `<div class="userOptions"> ${friend} ${ban} </div>`

        document.getElementById("userState").innerHTML = con
        userOptions_glich = true
    }
}

function handling_user(state, id) {
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
        xu.bans = cleaner(newBans)
    } else if (state === "ban" && xu.bans.includes(id) === false) {
        xu.bans.push(id)
        var newFriends = xu.friends
        xu.friends = cleaner(newFriends)
    } else {
        var newFriends = xu.friends
        var newBans = xu.bans
        xu.friends = cleaner(newFriends)
        xu.bans = cleaner(newBans)
    }
    userOptions(id, false)
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
    } else if(back === "messageRequests"){
        return `<div class="backArrow" onclick="messageRequests()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    } else if (back === "messages"){
        return `<div class="backArrow" onclick="messages()"> <img src="/icons/chevron-left-solid.svg" width="15px"> </div>`
    }
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
                <p class="chatting_alert"> <img src="/icons/lock-solid.svg" width="11px"> &nbsp; This chat is front-front encrypted. </p>
                ${messages_container()}
            </div>
            <div id="new_message_note"></div>
        </div>
        <div class="chatting_bottom"> <div class="chatting_bottom_sec"> <div class="message_input"> <input type="text" id="message_input" placeholder="Type a message"> </div> <div class="sendMessage" onclick="sendMessage('${id}')"> <img src="/icons/paper-plane-solid.svg" width="23px"> </div> </div> </div>
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

    // ADD IN HISTORY IF WAS NEW
    if (id in xu.messages === false) {
        xu.messages[id] = {
            "username": username,
            "messages": []
        }
    }

    if(back === "exitRandomly"){
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
            <div class="result_bio">${bio}</div>
            
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
                if (xu.friends.includes(key)) {
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

function sendMessage(id) {
    var mm = document.getElementById("message_input").value
    if (mm.length > 0) {
        socket.emit("sendMessage", {
            message: mm,
            id: id
        })

        var message = [mm, strTime(), false]
        xu.messages[id].messages.push(message)

        mes([mm, strTime()], false)
        document.getElementById("message_input").value = ""
    }
}

socket.on("message", e => {
    // TAKE THE DATA FROM THIS USER
    var id = e.id
    var username = e.username
    var message = [e.message, strTime(), true]

    if (xu.bans.includes(id) || xu.requests.includes(id)) {
        // USER BLOCK THIS USER OR ALERDAY ASK
        return false
    } else {
        if (id in xu.messages) {
            xu.messages[id].messages.push(message)
            xu.messages[id].username = username
        } else {
            // NEW MESSAGE FROM THIS USER ~ CREATE NEW FOLDER
            xu.messages[id] = {
                username: username,
                messages: [message]
            }
        }

        // push message to container
        if (xu.currentId === id && xu.chattingRoom === true) {
            mes(message, true)
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
        var m = `<div class="nothing" >Nothing to show.</div>`
        var nm = ``

        if (Object.keys(xu.messages).length > 0) {
            for (const [key, value] of Object.entries(xu.messages)) {
                if (!xu.friends.includes(key)) {
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
    var rud = xu.bans.concat(xu.friends, xu.requests)
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
        // ADD IN HISTORY IF WAS NEW
        if (id in xu.messages === false) {
            xu.messages[id] = {
                "username": username,
                "messages": []
            }
        }

        xu.onlineId = id
        chattingRoom("exitRandomly", id)
    }
})

// ERROR MESSAGE
socket.on("disconnect", (e) => {
    err.innerHTML = `<div class="err"> Sorry, an unknown error occurred during the connection, reconnect, <a href="/web"> (Refresh) </a></div>`
})
socket.on("err", e => {
    err.innerHTML = `<div class="err"> ${e}, <a href="/web"> (Refresh) </a></div>`
})


// DATA 
var idsTypeData = { 0: { id: "thespacechat_data", system: web3driver }, 1: { id: "googleDrive_data", system: googledrive } }
var typeData = -1

function select_data(id) {
    for (td in idsTypeData) {
        document.getElementById(idsTypeData[td].id).className = "data_select"
    }
    if (typeData !== id) {
        document.getElementById(idsTypeData[id].id).className = "data_select data_select_true"
        idsTypeData[id].system()
    }
}

function web3driver() {
    document.getElementById("upload_data_mes").innerHTML = `<div class="thespacechatDataLoaded"> If there is any data connected with this account, it will loaded after login. </div>`
}

function googledrive() {
    document.getElementById("upload_data_mes").innerHTML = `<div class="googleDataLoaded"> Sorry, This method not available yet. </div>`
}
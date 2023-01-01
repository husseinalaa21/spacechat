/*var questions = document.getElementById("questions");
var question_number = 0;
var questions_pool = {}

function question(q, n, st) {
    question_number = question_number + 1
    var displayStyle = "none;"
    var qClass = "qFalse"

    if (st === true) {
        displayStyle = "block;"
        qClass = "qTrue"
        questions_pool[question_number] = false
    } else {
        questions_pool[question_number] = true
    }

    var contact = `
        <div class='question_title' onclick='changeView("${question_number}")'>
            <p> ${q} </p>
        </div>
        <div id="n${question_number}" style="display:${displayStyle}">
            <div class='question_answer'> ${n} </div>
        </div>`

    var item = document.createElement("div")
    item.className = "question "+qClass
    item.id = "q"+question_number
    item.innerHTML = contact
    questions.appendChild(item)
}

function changeView(n) {
    if (questions_pool[n] === true) {
        document.getElementById(`n${n}`).style.display = "block"
        document.getElementById(`q${n}`).className = "question qTrue"
        questions_pool[n] = false
    } else {
        document.getElementById(`n${n}`).style.display = "none"
        document.getElementById(`q${n}`).className = "question qFalse"
        questions_pool[n] = true
    }
}

question(
    `What Thespacechat ?`,
    `It is a site is for random chatting with people from different countries of the world, please do not send any sensitive information to anyone under any reason, and we are not responsible for any exposure of any amount to you from anyone, so you should be alert . `,
    true
)
question(
    `What is the spical about TheSpacechat ?`,
    `TheSpacechat is a encrypt social media - no one will see your data except you.
    your data will be saved in front-end in yourside not in the server, that mean you have to save your data in a private file each time you enter or exit the app, and if you don't saved it you will lose your data.`,
    false
)
question(
    `How you can save your data ?`,
    `You can save your data in file or by copy and paste the data to the browser.`,
    false
)
question(
    `When TheSpacechat will be ready ?`,
    `in 12/31/2022.`,
    false
)*/
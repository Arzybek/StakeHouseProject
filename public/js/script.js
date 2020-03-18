function findBooked(arr) {
    var res = [];
    for (var i = 0; i < arr.length; i++) {
        res.push(arr[i].time);
    }
    return res;
}

function handlerDate(e) {
    e.preventDefault();
    let dateForm = document.forms["date"];
    let dateChosen = dateForm.elements["calendar"].value;
    let dateNow = new Date();
    dateChosen = new Date(dateChosen);

    if ($('#uncorrectDate').length)
        $('#uncorrectDate').remove();

    if ((dateChosen.getFullYear() !== dateNow.getFullYear() || dateChosen.getMonth() !== dateNow.getMonth()) ||
        ((dateChosen.getFullYear() === dateNow.getFullYear() || dateChosen.getMonth() === dateNow.getMonth()) &&
            (dateChosen.getDate() < dateNow.getDate()))
    ) {
        $('<p id="uncorrectDate">Вы выбрали некорректную дату.</p>').appendTo('.mainbody');
        $("#userInfo").remove();
    } else {
        if ($('#userInfo').length)
            $('#userInfo').remove();

        var timesGet = GetOrders(dateChosen.toLocaleDateString());
        console.log(timesGet);
        var booked;
        if (timesGet === "") {
            booked = [];
        } else booked = findBooked(timesGet);

        console.log(booked);
        let times = [];
        for (let i = 9; i < 23; i++) {
            let isOpen = true;
            for (let k = 0; k < booked.length; k++) {
                let time = booked[k];
                if (time == i) {
                    isOpen = false;
                    break;
                }
            }
            if (isOpen) {
                times.push(i);
            }
        }

        let selectTimes = '</p><p class="order"><label>Выберите время: </label><select name="text">';
        for (let k = 0; k < times.length; k++) {
            let time = `${times[k]}:00`;
            selectTimes += '\n<option value="' + time + '">' + time + '</option>';
        }
        selectTimes += "</select><\p>";

        $('<form id="userInfo">' +
            '<p class="order"> ' +
            '<label for="text">Представьтесь: </label>' +
            '<input type="text" name="name"/></p>' +
            '<p class="order"> ' +
            '<label for="email">Email: </label>' +
            '<input type="email" placeholder="user@gmail.com" name="email"/></p>' +
            '<p class="order">' +
            '<label for="phone">Телефон: </label>' +
            '<input type="tel" placeholder="(XXX)-XXX-XXXX" name="phone"/>' +
            '</p>' +
            '<p class="order">' +
            selectTimes +
            '</p>' +
            '<p class="order">' +
            '<button type="submit">Отправить</button>' +
            '</p>' + '</form>'
        ).appendTo('.mainbody');

        $("#userInfo").submit(function (e) {
            e.preventDefault();
            var email = this.elements["email"].value.trim();
            var phone = this.elements["phone"].value.trim();
            var time = this.elements["text"].value.trim();
            var name = this.elements["name"].value.trim();
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(email&&phone&&time&&name)
                if (email.match(re))
                    CreateOrder(name, email, phone, dateChosen.toLocaleDateString(), time);
        });
    }
}

function GetOrders(date) {
    var result = "";
    $.ajax({
        url: "/api/records/" + date,
        type: "GET",
        async: false,
        contentType: "application/json",
        success: function (record) {
            result = record;
        }
    });
    return result;
}

function CreateOrder(userName, userMail, userPhone, userDate, userTime) {
    $.ajax({
        url: "api/records",
        contentType: "application/json",
        method: "POST",
        async: false,
        data: JSON.stringify({
            name: userName,
            email: userMail,
            phone: userPhone,
            date: userDate,
            time: userTime
        }),
        success: function (user) {
            // $(".mainbody").append('<p>Заказ был сделан!</p>');
            window.location.href = `/success`;
        }
    })
}
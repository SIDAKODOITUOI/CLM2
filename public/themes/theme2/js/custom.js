$(document).ready(function (e) {
    typingEffect("#mainTitle", [$('#mainTitle').data('text')]);

    $('body').on('click', '.games[data-type]', function (e) {
        $('.tab-panel[data-type="game"]').show();
        $('.tab-panel[data-type="mini-game"]').hide();
    })

    $('body').on('click', 'button[data-game]', function (e) {
        let game = $(this).data('game');
        $('.tab-panel[data-type="game"]').hide();
        $('.tab-panel[data-type="mini-game"]').hide();
        $(`.tab-panel[data-type="mini-game"][data-name="${game}"]`).show();
    })

    $('body').on('click', '.mission-back', (e) => loadMission('stop'))

    $('body').on('click', '.button-muster', function (e) {
        let id = $(this).data('key');

        $('#muster-guide').hide();
        $('#muster-history').hide();
        $(`#${id}`).show();
    })

    $('body').on('click', '#checkTransId button, #checkByPhone button', function (e) {
        let id = $(this).parent().attr('id');
        let phone = $(`#${id} input[name="phone"]`).val();
        let transId = $(`#${id} input[name="transId"]`).val();

        $(`#${id} button`).hide();
        $('#transId-result').html('');
        axios.post('../api/v2/checkTransId', { phone, transId })
            .then(res => {
                (!res.data.success && res.data.data && !phone) ? $("#checkTransId").hide() && $('#checkByPhone input[name="transId"]').val(transId) && $("#checkByPhone").show() : loadTransId(null, res.data);
            }).catch(err => {
                loadTransId(err, null);
            }).finally(() => {
                $(`#${id} button`).show();
            });
    })


    $('body').on('click', '#jackpot button', function (e) {
        let action = $('#jackpot button').attr('data-action');
        console.log(action)
        let phone = $('#jackpot input[name="phone"]').val();

        if (!action) return alert('Thiếu dữ liệu hoặc lỗi!');

        jackpotAction();
        axios.post(`../api/v2/jackpot/${action}`, { phone })
            .then(res => {
                jackpotAction(null, null, res.data);
            }).catch(err => {
                jackpotAction(null, err);
            })
    })

    $('body').on('click', '.transId-refund', function (e) {
        let transId = $(this).data('id');

        if (!transId) return alert('Có lỗi xảy ra, hãy thử lại!');

        refundTransId();
        axios.post('../api/v2/refundTransId', { transId })
            .then(res => {
                refundTransId(null, null, res.data);
            }).catch(err => {
                refundTransId(null, err, null);
            })
    })

    $('body').on('click', '.jackpot-close', (e) => $('.jackpot').hide())
})

function numberCopy(data) {
    let _this = $(data.trigger);
    alert(`Đã sao chép số: ${data.text}, chơi tối đa ${Intl.NumberFormat('en-US').format(_this.data('min'))} VNĐ -> ${Intl.NumberFormat('en-US').format(_this.data('max'))} VNĐ.`)
}

function loadGame(err, response) {
    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    if (response.success) {
        $('#list-game').html('');

        response.data.map((data, index) => {
            $('#list-game').append(`<button class="btn btn-${index == 0 ? 'primary' : 'default'} mt-1 games" data-name="${data.name}" data-description="${data.description}" data-type="${data.gameType}">${data.name}</button>`);
        });
    }
}

function loadReward(err, response) {
    let dataGame = $('.games.btn-primary');

    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    if (response.success) {
        $('#gameNoti').html(dataGame.data('description'));
        $('#tableReward').html('');

        response.data.map((data) => {
            $('#tableReward').append(`<tr><td><b>${data.content}</b></td><td><b><code>${data.numberTLS.join(`</b></code> <code><b>`)}</code></td><td>x${data.amount}</td></tr>`);
        });
    }

}

function loadPhone(err, response) {
    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    if (response.success) {
        $('#tablePhone, #tableStatus').html('');

        response.data.map((data) => {
            $('#tablePhone').append(`<tr><td><b style="position: relative;">${data.phone}<span class="text-phone"><font color="green">${Intl.NumberFormat('en-US').format(data.amountDay)}</font>/<font color="6861b1">${convertCurrency(data.limitDay)}</font></span></b> <span class="label label-success text-uppercase copy-text" data-clipboard-text="${data.phone}" data-name="${data.name}" data-min="${data.betMin}" data-max="${data.betMax}"><i class="fa fa-clipboard" aria-hidden="true"></i></span></td><td>${Intl.NumberFormat('en-US').format(data.betMin)} VNĐ</td><td>${Intl.NumberFormat('en-US').format(data.betMax)} VNĐ</td></tr>`);
            $('#tableStatus').append(`<tr><td><b style="position: relative;">${data.phone}<span class="text-phone"><font color="green">${convertCurrency(data.betMin)}</font> -> <font color="6861b1">${convertCurrency(data.betMax)}</font></span></b> <span class="label label-success text-uppercase copy-text" data-clipboard-text="${data.phone}" data-name="${data.name}" data-min="${data.betMin}" data-max="${data.betMax}"><i class="fa fa-clipboard" aria-hidden="true"></i></span></td><td><span class="label label-success text-uppercase">Hoạt động</span></td><td>${data.count}</td><td>${Intl.NumberFormat('en-US').format(data.amountDay)}</td></tr>`);
        });
    }

}

function loadHistory(err, response) {
    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    if (response.success) {
        $('#tableHistory').html('');

        response.data.map((data) => {
            $('#tableHistory').append(`<tr><td>${data.phone}</td><td>${Intl.NumberFormat('en-US').format(data.amount)}</td><td>${Intl.NumberFormat('en-US').format(data.bonus)}</td><td>${data.gameName}</td><td>${data.content}</td><td><span class="label label-success text-uppercase">Thắng</span></td> : '<td><span class="badge badge-dark">Thua</span></td>'}</tr>`)
        })
    }
}

function loadMission(action, err, response) {
    if (action == 'start') {
        $('#checkMission .result-mission').remove();
        $('#checkMission .box-info').hide(), $('#checkMission').append(`<div class="form-group loading-mission box-success">Đang truy vấn... xin chờ nhé...</div>`);
        return;
    }
    if (action == 'stop') {
        $('#checkMission .box-info').show(), $('#checkMission .result-mission').remove();
        return;
    }

    err && alert(`Có lỗi xảy ra ${err.message}`);

    $('.loading-mission').remove();
    !response.success && $('#checkMission .box-info').show() && alert(response.message)
    response.success && $('#checkMission').append(`<div class="form-group result-mission box-success">Hi, <b>${response.data.name}</b><br>Tiến độ chơi: <font color="red">${Intl.NumberFormat('en-US').format(response.data.count)}</font><br>Phần thưởng hiện tại: <font color="blue">${Intl.NumberFormat('en-US').format(response.data.bonus)}</font> vnđ.<br><br><span class="btn btn-danger mission-back">Quay lại</button></div>`)
}

function loadMuster(err, response) {
    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    if (response.success && response.data) {

        $('#muster-session').html(`#${response.data.code}`);
        $('.muster-count').html(Intl.NumberFormat('en-US').format(response.data.count));
        $('#muster-winner').html(response.data.win);
        $('#muster-bonus').html(`${Intl.NumberFormat('en-US').format(response.data.bonus)}`);
        $('.muster-time').html(response.data.second);
    }

}

function loadHistoryMuster(err, response) {
    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    if (response.success) {
        $('#tableMuster').html('');

        response.data.map((data) => {
            $('#tableMuster').append(`<tr><td><small>#${data.code}</small></td><td><small>${data.count}</small></td><td>${data.phone}</td><td>${Intl.NumberFormat('en-US').format(data.amount)}</td></tr>`);
        })
    }
}

function addMuster(action = 'start', err, response) {
    if (action == 'start') {
        $('#addMuster .box-info').hide(), $('#addMuster').append(`<div class="form-group loading-muster box-success">Đang xử lý... xin chờ nhé...</div>`);
        return;
    }

    err && alert(`Có lỗi xảy ra ${err.message}`);

    $('.loading-muster').remove();
    $('#addMuster .box-info').show(), !err && alert(response.message);
}

function checkGift(action = 'start', err, response) {
    if (action == 'start') {
        $('#checkGift .box-info').hide(), $('#checkGift').append(`<div class="form-group loading-gift box-success">Đang xử lý... xin chờ nhé...</div>`);
        return;
    }

    err && alert(`Có lỗi xảy ra ${err.message}`);

    $('.loading-gift').remove();
    $('#checkGift .box-info').show(), !err && alert(response.message);
}

function loadTransId(err, response) {
    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    if (response.success) {
        let status, refund;
        let data = response.data;

        switch (data.status) {
            case 'wait':
                status = 'Đang xử lý';
                break;
            case 'done':
                status = 'Đã xử lý';
                break;
            case 'limitBet':
                refund = `Bạn đã chuyển tiền sai hạn mức, ${data.limit == null ? 'hệ thống không hỗ trợ hoàn tiền.' : (!data.limit ? 'vì bạn đã sử dụng hết lượt hoàn tiền trong ngày nên hệ thống sẽ không hỗ trợ hoàn.' : `kéo xuống click vào <span class="text-primary">HOÀN TIỀN</span> để được hoàn. <br> Bạn còn <b>${data.limit}</b> lượt hoàn tự động của số <b>${data.phone}</b> trong ngày. bạn có chắc chắn muốn hoàn chứ ?<br> <button class="btn btn-primary transId-refund" data-id="${data.transId}">HOÀN TIỀN</button>`)}`;
                status = 'Sai hạn mức';
                break;
            case 'errorComment':
                refund = `Bạn đã nhập nội dung không chính xác, ${data.limit == null ? 'hệ thống không hỗ trợ hoàn tiền.' : (!data.limit ? 'vì bạn đã sử dụng hết lượt hoàn tiền trong ngày nên hệ thống sẽ không hỗ trợ hoàn.' : `kéo xuống click vào <span class="text-primary">HOÀN TIỀN</span> để được hoàn. <br> Bạn còn <b>${data.limit}</b> lượt hoàn tự động của số <b>${data.phone}</b> trong ngày. bạn có chắc chắn muốn hoàn chứ ?<br> <button class="btn btn-primary transId-refund" data-id="${data.transId}">HOÀN TIỀN</button>`)}`;
                status = 'Sai nội dung';
                break;
            case 'limitRefund':
                status = 'Giới hạn hoàn';
                break;
            default:
                status = 'Lỗi xử lý';
                break;
        }
        !refund && (refund = `Kết quả: <font color="green"><b>${data.result == 'unknown' ? 'Không xác định' : (data.result == 'win' ? 'Thắng' : 'Thua')}</b></font><br>Trạng thái: <font color="0B615E"><b>${status}</b></font>`);
        $("#checkTransId").show(), $('#checkByPhone').hide(), $('#transId-noti').hide();
        $('#transId-result').html(`<div class="alert alert-danger"><b>Thông tin giao dịch</b><br>Mã GD: <font color="blue">${data.transId}</font><br>Số tiền: <font color="#9A2EFE">${Intl.NumberFormat('en-US').format(data.amount)}</font><br>Tiền nhận: <font color="5E610B"><b>${Intl.NumberFormat('en-US').format(data.bonus)}</b></font><br>Thời gian GD: <font color="8A0808">${data.time}</font><br>Nội dung: <font color="#FF0080"><b>${data.comment}</b></font><br><b>Thông tin trò chơi</b><br><hr>${refund}</div>`);
    }
}

function refundTransId(action = 'start', err, response) {
    if (action == 'start') {
        $('#transId-result').html('');
        return;
    }

    err && alert(`Có lỗi xảy ra ${err.message}`);
    !err && alert(response.message);
}

function jackpotCheck(action = 'start', err, response) {
    if (action == 'start') {
        $('#jackpot button').html('Đang xử lý...').prop('disabled', true);
        return;
    }

    err && alert(`Có lỗi xảy ra ${err.message}`);
    !response.success && alert(response.message);

    $('#jackpot button').html('Tham Gia').prop('disabled', false);

    response.success && $('#jackpot button').attr('data-action', response.data.isJoin == 1 ? 'out' : 'join').html(response.data.isJoin == 1 ? 'Huỷ' : 'Tham Gia').prop('disabled', false);
}

function jackpotAction(action = 'start', err, response) {
    if (action == 'start') {
        $('#jackpot button').html('Đang xử lý...').prop('disabled', true);
        return;
    }

    err && alert(`Có lỗi xảy ra ${err.message}`);

    $('#jackpot input[name="phone"]').val(''), $('#jackpot button').html('Tham Gia').prop('disabled', false), alert(response.message);
}
const moment = require('moment');
const momoModel = require('../../models/momo.model');
const momoHelper = require('../../helpers/momo.helper');

const checkController = {
    index: async (req, res, next) => {
        try {
            if (!res.locals.profile.permission.useCheck) {
                res.redirect(`..${res.locals.adminPath}/dashboard`);
                return;
            }

            let phones = await momoModel.find().lean();
            res.render('admin/checkTrans', {
                title: 'Kiểm Tra Giao Dịch',
                phones
            });
        } catch (err) {
            next(err);
        }
    },
    check: async (req, res, next) => {
        try {
            let { phone, transId, limit } = req.body;

            if (!res.locals.profile.permission.useCheck) {
                return res.json({
                    success: false,
                    message: 'Không có quyền thao tác!'
                })
            }

            if (!phone && !transId && !limit) {
                return res.json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ thông tin!'
                })
            }

            if (phone && transId) {
                let detail = await momoHelper.getDetails(phone, transId);

                if (!detail.success) {
                    return res.json({
                        success: false,
                        message: detail.message
                    })
                }

                return res.json({
                    success: true,
                    message: 'Thành công!',
                    data: {
                        io: detail.data.io,
                        transId: detail.data.transId,
                        targetId: momoHelper.convertPhone(detail.data.targetId),
                        partnerId: momoHelper.convertPhone(detail.data.partnerId),
                        amount: detail.data.amount,
                        comment: detail.data.comment,
                        timeTLS: detail.data.time
                    }
                })
            }

            if (!phone || !limit) {
                return res.json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ thông tin!'
                })
            }

            let history = await momoHelper.getHistory(phone, {
                dataType: res.locals.settings.history.dataType,
                limit
            })

            if (!history.success) {
                return res.json({
                    success: false,
                    message: history.message
                })
            }


            let data = [];
            for (let detail of history.data) {
                data.push({
                    io: detail.io,
                    status: detail.status,
                    transId: detail.transId,
                    targetId: momoHelper.convertPhone(detail.username),
                    partnerId: momoHelper.convertPhone(detail.sourceId),
                    amount: detail.totalAmount,
                    postBalance: detail.postBalance,
                    time: detail.createdAt
                })
            }

            return res.json({
                success: true,
                message: 'Thành công!',
                data
            })
        } catch (err) {
            next(err);
        }
    }
}

module.exports = checkController;
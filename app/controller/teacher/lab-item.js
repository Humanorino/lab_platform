// 实验列表函数 
var LabItem = require('../../models/lab').LabItem;
var LabRef = require('../../models/lab').LabRef;
var LabDetail = require('../../models/lab').LabDetail;
var LabPost = require('../../models/lab-post').LabPost;
var LabRequest = require('./lab-request-params');
var labRef = require('./lab-ref');
var labDetail = require('./lab-detail');
var async = require('async');

// 创建实验列表 
module.exports.createLabItem = function(req, res) {
    // 获取请求的参数    
    // (实验类别, 实验名称, 实验描述, 实验缩略图url, 实验创建者, 实验创建者教工号, 实验是否公开)
    req.body.thumbnail = req.file.filename;
    var labItem = LabRequest.getLabItem(req);
    // 保存到实验列表项目 LabItem collections中
    labItem.save(function(err) {
        if (err) {
            console.error("实验列表创建失败:\n", err);
            return res.status(404).json({
                success: false,
                message: "实验列表创建失败"
            });
        } else {
            //=====================================//
            // 创建实验详情
            labDetail.createLabDetail(res, labItem);
        }
    });

};

// 更新实验列表
module.exports.updateLabItem = function(req, res) {
    if (req.body.createdByNumber != req.decoded.number) {
        return res.status(401).json({
            success: false,
            message: "你无权修改此实验条目"
        });
    } else {
        var query = { "expItemId": req.body.expItemId };
        var update = LabRequest.getLabItem(req, true);
        // 返回修改后的document
        var options = { new: true };
        LabItem.findOneAndUpdate(query, update, options, function(err, labItem) {
            if (err) {
                return res.status(404).json({
                    success: false,
                    message: "实验列表更新失败"
                });
            } else {
                //   更新实验引用表
                if (req.body.isPublic != undefined) {
                    // isPublic 被改变后, 更新实验引用表中 isPublic 的值
                    labRef.updateLabRef(res, labItem);
                } else {
                    return res.status(200).json({
                        success: true,
                        labItem: update
                    });
                }
            }
        });
    }
};

// 根据查询条件获取实验列表
var getLabs = function(req, res, query) {
    // 选择数据库返回的字段(或不返回的字段, 0: 不返回, 1: 返回)
    var projection = {
        "_id": 0,
        "__v": 0
    };
    // 按照修改时间排序: 降序
    var options = {
        sort: {
            // 1 是升序, -1 是降序
            "modifiedDate": -1
        }
    };
    LabItem.find(query, projection, options, function(err, labItems) {
        if (err) {
            return res.status(404).json({
                success: false,
                message: "实验列表获取失败"
            });
        } else {
            return res.status(200).json({
                success: true,
                labItems: labItems
            });
        }
    });
};

// 获取实验列表
module.exports.getLabItemList = function(req, res) {
    // 查询条件
    var query = {
        labCategory: req.params.category,
        $or: [{
            isPublic: true,
            createdByNumber: { $ne: req.decoded.number }
        }, {
            createdByNumber: req.decoded.number
        }]
    };
    getLabs(req, res, query);
};

// 查询即将被删除的实验中, 是否有实验被其他老师引用
module.exports.deleteLabs = function(req, res) {
    /*
        1. 根据 expItemId, 查询LabPost, LabRef表
        2. 根据 1 中查询的结果来决定是否删除 LabItem, LabRef, LabDetail表
    */
    // 请求删除的expItemId数组
    var expItemIdArray = JSON.parse(req.params.expItemIdArray);
    // 被其他老师引用的实验下标
    var beenRefed = [];
    // 被其他学生选择
    var beenChoosed = [];
    // 存放成功删除的实验下标
    var hasDeleted = [];
    // 删除失败
    var errorDeleted = [];
    // 遍历 expItemIdArray 数组, 并删除允许删除的 实验
    async.each(expItemIdArray, function(expItemIdObj, callbackEnd) {
        var asyncSearchTasks = [];
        // 查询LabRef表的条件
        var queryLabRef = {
            'expItemId': expItemIdObj.expItemId,
            'refName.number': req.decoded.number,
            'refLength': { $gte: 1 }
        };
        // 查询LabPost表的条件
        var queryLabPost = {
            'expItemId': expItemIdObj.expItemId,
            'teacherNumber': req.decoded.number
        };
        // 查询 LabRef collection
        asyncSearchTasks.push(function(callback) {
            // 如果LabRef collection 中能找到非空的labRef document
            // 说明: 该实验已经被其他老师引用 
            LabRef.findOne(queryLabRef, function(err, labRef) {
                if (err) {
                    return callback(!null, false);
                }
                if (labRef === null) {
                    // 该实验没有被其他老师引用
                    callback(null, true);
                } else {
                    beenRefed.push(expItemIdObj.index);
                    callback(null, false);
                }
            });
        });
        // 查询 LabPost collection
        asyncSearchTasks.push(function(callback) {
            // 如果LabRef collection 中能找到非空的labRef document
            // 说明: 该实验已经被其他老师引用 
            LabPost.findOne(queryLabPost, function(err, labPost) {
                if (err) {
                    return callback(!null, false);
                }
                if (labPost === null) {
                    // 该实验没有被其他学生选择
                    callback(null, true);
                } else {
                    beenChoosed.push(expItemIdObj.index);
                    callback(null, false);
                }
            });
        });

        // 执行异步任务集合
        async.parallel(asyncSearchTasks, function(err, result) {
            if (err) {
                return;
            }
            if (result[0] && result[1]) {
                // 实验既没有被老师引用, 也没有被学生选择, 该实验允许被删除
                // 存放执行异步操作的数组
                // 依次删除实验详情, 实验引用, 实验列表 document
                LabDetail.remove({ expItemId: expItemIdObj.expItemId }).exec();
                LabRef.remove({ expItemId: expItemIdObj.expItemId }).exec();
                LabItem.remove({ expItemId: expItemIdObj.expItemId }).exec();
                hasDeleted.push(expItemIdObj.index);
                callbackEnd(null);
            } else {
                callbackEnd(null);
            }
        });
    }, function(err) {
        if (err) {
            return res.status(404).json({
                success: false,
                message: "删除失败"
            });
        }
        return res.status(200).json({
            success: true,
            hasDeleted: hasDeleted,
            beenChoosed: beenChoosed,
            beenRefed: beenRefed
        });
    });
};

// 查询属于某位老师的实验, 包含自己创建的, 引用别人的
module.exports.getPersonalLab = function(req, res) {
    // 提取请求的参数: 老师的教工号
    var query = { 'refName.number': req.decoded.number };
    // 选择数据库返回的字段(或不返回的字段, 0: 不返回, 1: 返回)
    var projection = {
        "_id": 0,
        "__v": 0
    };
    LabRef.find(query, projection, function(err, expItemIds) {
        if (err) {
            return res.status(404).json({
                success: false,
                message: "实验引用表查询失败"
            });
        }
        var expItemIdArray = [];
        expItemIds.forEach(function(element, index) {
            expItemIdArray.push(element.expItemId);
        });
        if (expItemIdArray.length != 0) {
            // 查询条件
            query = {
                expItemId: { $in: expItemIdArray }
            };
            // 获取实验列表
            getLabs(req, res, query);
        } else {
            return res.status(200).json({
                success: true,
                labItems: []
            })
        }
    });
};

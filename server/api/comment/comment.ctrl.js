const Comment = require("../../model/comment");
const moment = require("../../services/moment");
const { ObjectId } = require("mongodb");
const userService = require("../../services/userService");

const createComment = async (req, res) => {
    try {
        const postNumber = parseInt(req.params.postNumber);
        const content = req.body.content;
        if (!content) return res.status(400).send("내용을 입력해주세요.");

        if (res.locals.user.userId != null) {
            new Comment({
                _id: ObjectId().toString(),
                postNumber: postNumber,
                userId: res.locals.user.userId,
                writer: res.locals.user.name,
                content: content,
            }).save((err, result) => {
                if (err) return res.status(500).send(err);
                res.status(201).json(result);
            });
        } else {
            return res.status(401).send("로그인을 해야 댓글을 작성할 수 있습니다.");
        }
    } catch (err) {
        res.send({ err: err.message });
    }
};

const getAllComment = async (req, res) => {
    try {
        const postNumber = parseInt(req.params.postNumber);
        const result = await Comment.find({ postNumber: postNumber });

        let exData = [];
        for (let element of result) {
            const auth = await userService.authCheck(res.locals.user.userId, element.userId);
            const user = await userService.findUserById(element.userId);

            let data = Object.assign({}, element)._doc;
            data.userRole = user.role;
            data.auth = auth;

            await exData.push(data);
        }

        res.status(200).json(exData);
    } catch (err) {
        res.send({ err: err.message });
    }
};

const getReplyComment = async (req, res) => {
    try {
        const parentId = req.params.parentId;
        const childComment = await Comment.find({
            parentId: parentId,
            depth: 2,
        });

        let exData = [];
        for (let element of childComment) {
            const auth = await userService.authCheck(res.locals.user.userId, element.userId);

            let data = Object.assign({}, element)._doc;
            data.auth = auth;

            await exData.push(data);
        }
        res.status(200).json(exData);
    } catch (err) {
        res.send({ err: err.message });
    }
};

const editComment = (req, res) => {
    try {
        const id = req.params.id;
        Comment.findOne({ _id: id }, function (err, data) {
            console.log(data);
            if (err) return res.status(500).json({ error: error.message });

            Comment.updateOne(
                { _id: id },
                {
                    $set: {
                        content: req.body.content,
                        date: moment.dateNow(),
                    },
                },
                function (err, data) {
                    if (err) return res.status(500).json({ error: error.message });

                    res.status(200).send({ message: "수정 완료" });
                }
            );
        });
    } catch (err) {
        res.send({ err: err.message });
    }
};

const deleteComment = (req, res) => {
    try {
        const id = req.params.id;
        Comment.findOne({ _id: id }, function (err, data) {
            console.log(data);
            if (err) return res.status(500).json({ error: error.message });

            Comment.updateOne(
                { _id: id },
                {
                    $set: {
                        isDeleted: true,
                    },
                },
                function (err, data) {
                    if (err) return res.status(500).json({ error: error.message });

                    res.status(200).send({ message: "삭제 완료" });
                }
            );
        });
    } catch (err) {
        res.send({ err: err.message });
    }
};

const replyComment = async (req, res) => {
    try {
        const parentId = req.params.parentId;
        const parentComment = await Comment.findOne({ _id: parentId });
        const postNumber = parentComment.postNumber;
        const content = req.body.content;

        if (res.locals.user.userId != null) {
            new Comment({
                _id: ObjectId().toString(),
                parentId: parentId,
                postNumber: postNumber,
                content: content,
                depth: 2,
                userId: res.locals.user.userId,
                writer: res.locals.user.name,
            }).save((err, result) => {
                if (err) return res.status(500).send(err);
                res.status(201).json(result);
            });
        } else {
            return res.status(401).send("로그인을 해야 댓글을 작성할 수 있습니다.");
        }
    } catch (err) {
        res.send({ err: err.message });
    }
};

module.exports = {
    createComment,
    getAllComment,
    getReplyComment,
    editComment,
    deleteComment,
    replyComment,
};